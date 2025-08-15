import { Request, Response } from 'express';
import OrderReport, { IOrderReport } from '../models/OrderReport';
import Order from '../models/Order';
import User from '../models/User';
import { updateOrderStatus } from './orderController';

interface RequestWithUser extends Request {
  user?: { id: string; email: string; role: string };
}

// 創建訂單報告
// POST /order-reports
export const createOrderReport = async (req: RequestWithUser, res: Response) => {
  try {
    const { title, description, orderId, assignedTo, disposalQuantity, disposalMethod, evidenceLinks, materials, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // 驗證必要欄位
    if (!title || !description || !orderId || !assignedTo || !disposalQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, description, orderId, assignedTo, disposalQuantity' 
      });
    }

    // 檢查指派的用戶是否存在且是 regulatory 角色
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Assigned user not found' 
      });
    }

    if (assignedUser.role !== 'regulator') {
      return res.status(400).json({ 
        success: false, 
        error: 'Assigned user must be a regulator' 
      });
    }

    // 檢查訂單是否存在
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    // 檢查處置數量是否合理
    if (disposalQuantity > order.producedQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Disposal quantity cannot exceed produced quantity' 
      });
    }

    // 檢查處置數量是否超過可處置的總數量（inUseQuantity + unusedQuantity）
    const availableForDisposal = order.inUseQuantity + order.unusedQuantity;
    if (disposalQuantity > availableForDisposal) {
      return res.status(400).json({ 
        success: false, 
        error: `Disposal quantity (${disposalQuantity}) cannot exceed available quantity (${availableForDisposal})` 
      });
    }

    // 處理 evidenceLinks（可選）
    let sanitizedEvidenceLinks: string[] | undefined = undefined;
    if (Array.isArray(evidenceLinks)) {
      sanitizedEvidenceLinks = evidenceLinks
        .filter((v: any) => typeof v === 'string')
        .map((v: string) => v.trim())
        .filter((v: string) => v.length > 0);
    }

    // 處理 materials（可選）
    let sanitizedMaterials: any[] | undefined = undefined;
    if (Array.isArray(materials)) {
      sanitizedMaterials = materials.map((m: any) => ({
        materialKey: typeof m?.materialKey === 'string' ? m.materialKey.trim() : '',
        wasteStreamClassification: Array.isArray(m?.wasteStreamClassification) ? m.wasteStreamClassification.filter((x: any) => typeof x === 'string' && x.trim() !== '') : [],
        labellingAndPackaging: Array.isArray(m?.labellingAndPackaging) ? m.labellingAndPackaging.filter((x: any) => typeof x === 'string' && x.trim() !== '') : [],
        transportationAndStorage: typeof m?.transportationAndStorage === 'string' ? m.transportationAndStorage.trim() : '',
        condition: Array.isArray(m?.condition) ? m.condition.filter((x: any) => typeof x === 'string' && x.trim() !== '') : [],
        disposalMethod: Array.isArray(m?.disposalMethod) ? m.disposalMethod.filter((x: any) => typeof x === 'string' && x.trim() !== '') : [],
        attachments: Array.isArray(m?.attachments) ? m.attachments.filter((a: any) => a && typeof a.fileId === 'string' && typeof a.fileName === 'string' && typeof a.mimeType === 'string').map((a: any) => ({
          fileId: a.fileId.trim(),
          fileName: a.fileName.trim(),
          mimeType: a.mimeType.trim()
        })) : []
      })).filter((mm: any) => mm.materialKey !== '');
      if (sanitizedMaterials.length === 0) sanitizedMaterials = undefined;
    }

                // 創建報告（submittedAt 由後端生成）
      console.log(`[DEBUG] Creating order report`);
      const report = await OrderReport.create({
        title,
        description,
        orderId,
        assignedTo,
        createdBy: userId,
        disposalQuantity,
        disposalMethod,
        ...(sanitizedEvidenceLinks ? { evidenceLinks: sanitizedEvidenceLinks } : {}),
        ...(sanitizedMaterials ? { materials: sanitizedMaterials } : {}),
        ...(typeof notes === 'string' && notes.trim() !== '' ? { notes: notes.trim() } : {}),
        submittedAt: new Date()
      });

      // 直接更新訂單的處置數量
      console.log(`[DEBUG] Directly updating order ${orderId} with disposalQuantity: ${disposalQuantity}`);
      
      // 重新查詢訂單以確保數據是最新的
      const currentOrder = await Order.findById(orderId);
      if (!currentOrder) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      console.log(`[DEBUG] Current order state:`, {
        status: currentOrder.status,
        inUseQuantity: currentOrder.inUseQuantity,
        disposedQuantity: currentOrder.disposedQuantity,
        unusedQuantity: currentOrder.unusedQuantity,
        producedQuantity: currentOrder.producedQuantity
      });

      // 檢查數量總和是否正確
      const currentTotal = currentOrder.inUseQuantity + currentOrder.disposedQuantity + currentOrder.unusedQuantity;
      console.log(`[DEBUG] Current total: ${currentTotal}, should equal: ${currentOrder.producedQuantity}`);
      
      if (currentTotal !== currentOrder.producedQuantity) {
        console.error(`[DEBUG] Quantity mismatch! Current total: ${currentTotal}, produced: ${currentOrder.producedQuantity}`);
        return res.status(400).json({ 
          success: false, 
          error: `Order quantity mismatch: total (${currentTotal}) != produced (${currentOrder.producedQuantity})` 
        });
      }

      // 直接更新數量 - 優先從 inUseQuantity 處置，然後從 unusedQuantity
      const newDisposedQuantity = currentOrder.disposedQuantity + disposalQuantity;
      
      let newInUseQuantity = currentOrder.inUseQuantity;
      let newUnusedQuantity = currentOrder.unusedQuantity;
      
      // 優先從 inUseQuantity 處置
      if (currentOrder.inUseQuantity >= disposalQuantity) {
        newInUseQuantity = currentOrder.inUseQuantity - disposalQuantity;
      } else {
        // 如果 inUseQuantity 不夠，從 unusedQuantity 處置剩餘部分
        const remainingFromUnused = disposalQuantity - currentOrder.inUseQuantity;
        newInUseQuantity = 0;
        newUnusedQuantity = currentOrder.unusedQuantity - remainingFromUnused;
      }
      
      console.log(`[DEBUG] Updating quantities:`, {
        disposedQuantity: `${currentOrder.disposedQuantity} -> ${newDisposedQuantity}`,
        inUseQuantity: `${currentOrder.inUseQuantity} -> ${newInUseQuantity}`,
        unusedQuantity: `${currentOrder.unusedQuantity} -> ${newUnusedQuantity}`
      });
      
      currentOrder.disposedQuantity = newDisposedQuantity;
      currentOrder.inUseQuantity = newInUseQuantity;
      currentOrder.unusedQuantity = newUnusedQuantity;
      currentOrder.updatedAt = new Date();
      
      console.log(`[DEBUG] After update:`, {
        inUseQuantity: currentOrder.inUseQuantity,
        disposedQuantity: currentOrder.disposedQuantity,
        unusedQuantity: currentOrder.unusedQuantity,
        producedQuantity: currentOrder.producedQuantity,
        newTotal: currentOrder.inUseQuantity + currentOrder.disposedQuantity + currentOrder.unusedQuantity
      });

      // 保存到數據庫
      try {
        await currentOrder.save();
        console.log(`[DEBUG] Order saved successfully`);
      } catch (saveError) {
        console.error(`[DEBUG] Save error:`, saveError);
        return res.status(400).json({ 
          success: false, 
          error: `Failed to save order: ${saveError.message}` 
        });
      }

      // 返回詳細信息
      const populatedReport = await OrderReport.findById(report._id)
        .populate('assignedTo', 'firstName lastName email role')
        .populate('createdBy', 'firstName lastName email role')
        .populate('orderId', 'batchNumber status producedQuantity inUseQuantity disposedQuantity unusedQuantity');

      res.status(201).json({
        success: true,
        data: populatedReport,
        message: 'Order report created successfully'
      });
  } catch (err) {
    console.error('Create order report error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取訂單報告列表
// GET /order-reports
export const getOrderReports = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // 獲取查詢參數
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    // 構建查詢條件
    const query: any = {};

    // 根據用戶角色篩選
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'regulator') {
      // Regulatory 用戶可以看到所有報告（用於審核）
      // 不添加任何篩選條件
    } else if (user.role === 'manufacturer') {
      // Manufacturer 用戶只能看到自己創建的報告
      query.createdBy = userId;
    }
    // Admin 可以看到所有報告

    // 添加搜尋條件
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 添加狀態篩選
    if (status) {
      query.status = status;
    }

    // 執行查詢
    const reports = await OrderReport.find(query)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .populate('orderId', 'batchNumber status producedQuantity')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // 獲取總數
    const total = await OrderReport.countDocuments(query);

    // 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      count: reports.length
    });
  } catch (err) {
    console.error('Get order reports error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取單個訂單報告
// GET /order-reports/:id
export const getOrderReportById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const report = await OrderReport.findById(id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .populate({
        path: 'orderId',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName email'
        }
      });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Order report not found' });
    }

    // 檢查權限
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Regulatory 用戶可以查看所有報告（用於審核）
    if (user.role === 'regulator') {
      // 允許所有 regulatory 用戶查看報告
    }

    if (user.role === 'manufacturer' && report.createdBy._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 構建響應數據，包含完整的訂單資訊
    const responseData = {
      ...report.toObject(),
      orderDetails: report.orderId // 包含完整的訂單資訊
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (err) {
    console.error('Get order report by ID error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 更新訂單報告狀態
export const updateOrderReportStatus = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // 驗證狀態
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be pending, approved, or rejected' 
      });
    }

    const report = await OrderReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Order report not found' });
    }

    // 檢查權限 - 只有指派的 regulatory 用戶或 admin 可以更新狀態
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role !== 'admin' && user.role !== 'regulator') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 更新報告
    const updatedReport = await OrderReport.findByIdAndUpdate(
      id,
      { 
        status,
        ...(comment && { comment })
      },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email role')
     .populate('createdBy', 'firstName lastName email role')
     .populate('orderId', 'batchNumber status producedQuantity');

    res.json({
      success: true,
      data: updatedReport,
      message: 'Order report status updated successfully'
    });
  } catch (err) {
    console.error('Update order report status error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 刪除訂單報告
export const deleteOrderReport = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const report = await OrderReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Order report not found' });
    }

    // 檢查權限 - 只有創建者或 admin 可以刪除
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role !== 'admin' && report.createdBy._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await OrderReport.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Order report deleted successfully'
    });
  } catch (err) {
    console.error('Delete order report error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 自動創建訂單報告（當訂單需要處置時調用）
export const autoCreateOrderReport = async (orderId: string, createdBy: string, disposalQuantity: number) => {
  try {
    console.log('Auto create order report called with:', { orderId, createdBy, disposalQuantity });
    
    // 找到一個可用的 regulatory 用戶
    const regulatoryUser = await User.findOne({ role: 'regulator' });
    if (!regulatoryUser) {
      console.error('No regulatory user found for order report assignment');
      return null;
    }
    console.log('Found regulatory user:', regulatoryUser._id);

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found for report creation');
      return null;
    }
    console.log('Found order:', order.batchNumber);

    const report = await OrderReport.create({
      title: `Disposal Request: Order ${order.batchNumber}`,
      description: `Disposal request for order ${order.batchNumber}. Quantity: ${disposalQuantity}`,
      orderId,
      assignedTo: regulatoryUser._id,
      createdBy,
      disposalQuantity
    });

    console.log(`Order report created successfully: ${report._id}`);
    return report;
  } catch (err) {
    console.error('Auto create order report error:', err);
    return null;
  }
}; 