import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Model from '../models/Model';
import User from '../models/User';
import Organization from '../models/Organization';
import { Request as ExpressRequest } from 'express';
import { autoCreateOrderReport } from './orderReportController';

interface RequestWithUser extends ExpressRequest {
  user?: { id: string; email: string; role: string };
}

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management API
 */

// 創建訂單
export const createOrder = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      modelId,
      batchNumber,
      endUserCompanyId,
      producedQuantity
    } = req.body;

    // 驗證必填欄位
    if (!modelId || !batchNumber || !endUserCompanyId || !producedQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: modelId, batchNumber, endUserCompanyId, producedQuantity' 
      });
    }

    // 檢查用戶是否存在
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 檢查用戶是否為 manufacturer
    if (user.role !== 'manufacturer') {
      return res.status(403).json({ success: false, error: 'Only manufacturers can create orders' });
    }

    // 檢查模型是否存在
    const model = await Model.findById(modelId);
    if (!model) return res.status(404).json({ success: false, error: 'Model not found' });

    // 檢查用戶是否有權限訪問此模型
    const modelOrgId = model.organizationId._id ? model.organizationId._id.toString() : model.organizationId.toString();
    const userOrgId = user.organizationId?.toString();
    
    if (modelOrgId !== userOrgId) {
      return res.status(403).json({ success: false, error: 'Access denied to this model' });
    }

    // 檢查批次號是否已存在
    const existingOrder = await Order.findOne({ batchNumber });
    if (existingOrder) {
      return res.status(400).json({ success: false, error: 'Batch number already exists' });
    }

    // 創建訂單時，初始數量分配：全部為未使用
    const initialUnusedQuantity = producedQuantity;
    const initialInUseQuantity = 0;
    const initialDisposedQuantity = 0;

    const order = new Order({
      modelId,
      batchNumber,
      endUserCompanyId,
      producedQuantity,
      inUseQuantity: initialInUseQuantity,
      disposedQuantity: initialDisposedQuantity,
      unusedQuantity: initialUnusedQuantity,
      createdBy: userId,
      status: 'production'
    });

    await order.save();

    // 填充相關數據
    const populatedOrder = await Order.findById(order._id)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone website taxId')
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email organizationId',
        populate: {
          path: 'organizationId',
          select: 'name type address email contactPhone website taxId'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error: any) => error.message);
      return res.status(400).json({
        success: false,
        error: validationErrors.join(', ')
      });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取訂單列表
// GET /orders
export const getOrders = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { page = 1, limit = 10, search = '', status, scope = 'my' } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 構建查詢條件
    const query: any = {};
    
    console.log('Debug: User role:', user.role);
    console.log('Debug: User organizationId:', user.organizationId);
    
    // 先查詢所有訂單來檢查數據
    const allOrders = await Order.find({});
    console.log('Debug: Total orders in database:', allOrders.length);
    
    if (allOrders.length > 0) {
      console.log('Debug: Sample order endUserCompanyId:', allOrders[0].endUserCompanyId);
      console.log('Debug: Sample order endUserCompanyId type:', typeof allOrders[0].endUserCompanyId);
    }
    
    // 根據 scope 參數決定查詢範圍
    if (scope === 'my') {
      if (user.role === 'endUser') {
        // endUser 查看屬於自己組織的訂單
        console.log('Debug: endUser organizationId:', user.organizationId);
        console.log('Debug: endUser organizationId type:', typeof user.organizationId);
        
        // 使用 ObjectId 查詢，確保類型匹配
        if (user.organizationId) {
          query.endUserCompanyId = user.organizationId;
        }
        console.log('Debug: query.endUserCompanyId:', query.endUserCompanyId);
      } else {
        // 其他角色查看自己創建的訂單
        query.createdBy = userId;
      }
    } else if (scope === 'organization') {
      // 查詢組織內所有訂單（需要適當權限）
      if (user.role !== 'admin' && user.role !== 'manufacturer') {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. Only admin and manufacturer can view organization orders.' 
        });
      }
      // 不添加 createdBy 限制，查詢組織內所有訂單
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid scope parameter. Use "my" or "organization".' 
      });
    }
    
    if (search) {
      query.$or = [
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    console.log('Debug: Final query:', JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone website taxId')
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email organizationId',
        populate: {
          path: 'organizationId',
          select: 'name type address email contactPhone website taxId'
        }
      })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await Order.countDocuments(query);

    console.log('Debug: Found orders:', orders.length);
    console.log('Debug: Total count:', total);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        pages: Math.ceil(total / +limit)
      }
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取單一訂單
export const getOrderById = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const orderId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const order = await Order.findById(orderId)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone website taxId')
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email organizationId',
        populate: {
          path: 'organizationId',
          select: 'name type address email contactPhone website taxId'
        }
      });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // 檢查用戶是否有權限查看此訂單
    const orderEndUserCompanyId = typeof order.endUserCompanyId === 'object' && order.endUserCompanyId._id 
      ? order.endUserCompanyId._id.toString() 
      : order.endUserCompanyId.toString();
    
    const canView = 
      order.createdBy.toString() === userId || // 創建者可以查看
      user.role === 'admin' || // admin 可以查看所有
      user.role === 'manufacturer' || // manufacturer 可以查看所有
      (user.role === 'endUser' && user.organizationId && orderEndUserCompanyId === user.organizationId.toString()); // endUser 可以查看屬於自己組織的訂單
    
    if (!canView) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Get order by id error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 更新訂單
export const updateOrder = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const orderId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // 檢查用戶是否有權限更新此訂單
    const orderEndUserCompanyId = typeof order.endUserCompanyId === 'object' && order.endUserCompanyId._id 
      ? order.endUserCompanyId._id.toString() 
      : order.endUserCompanyId.toString();
    
    const canUpdate = 
      order.createdBy.toString() === userId || // 創建者可以更新
      user.role === 'admin' || // admin 可以更新所有
      user.role === 'manufacturer' || // manufacturer 可以更新所有
      (user.role === 'endUser' && user.organizationId && orderEndUserCompanyId === user.organizationId.toString()); // endUser 可以更新屬於自己組織的訂單
    
    if (!canUpdate) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // 如果更新數量，首先在 pending 狀態下一律禁止
    const isUpdatingQuantities = (
      req.body.inUseQuantity !== undefined ||
      req.body.disposedQuantity !== undefined ||
      req.body.unusedQuantity !== undefined
    );

    if (isUpdatingQuantities && order.status === 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify quantities while order is in pending status'
      });
    }

    // 如果更新數量，驗證總和
    if (isUpdatingQuantities) {
      const inUseQuantity = req.body.inUseQuantity ?? order.inUseQuantity;
      const disposedQuantity = req.body.disposedQuantity ?? order.disposedQuantity;
      const unusedQuantity = req.body.unusedQuantity ?? order.unusedQuantity;
      const producedQuantity = order.producedQuantity;

      const total = inUseQuantity + disposedQuantity + unusedQuantity;
      if (total !== producedQuantity) {
        return res.status(400).json({ 
          success: false, 
          error: 'Quantity sum must equal produced quantity' 
        });
      }
    }

    // 使用 findById 和 save() 來確保觸發 pre('save') 中間件
    const orderToUpdate = await Order.findById(orderId);
    if (!orderToUpdate) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // 更新訂單數據
    Object.assign(orderToUpdate, updateData);
    await orderToUpdate.save();
    
    // 重新查詢以獲取填充的數據
    const updatedOrder = await Order.findById(orderId)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone website taxId')
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email organizationId',
        populate: {
          path: 'organizationId',
          select: 'name type address email contactPhone website taxId'
        }
      });

    // 檢查是否需要創建處置報告
    console.log('Checking if order report should be created:', {
      disposedQuantity: req.body.disposedQuantity,
      orderId,
      userId
    });
    
    if (req.body.disposedQuantity && req.body.disposedQuantity > 0) {
      console.log('Attempting to create order report...');
      try {
        await autoCreateOrderReport(orderId, userId, req.body.disposedQuantity);
        console.log('Order report creation completed successfully');
      } catch (reportError) {
        console.error('Failed to create order report:', reportError);
        // 不中斷更新流程，只記錄錯誤
      }
    } else {
      console.log('No disposal quantity provided or quantity is 0');
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (err) {
    console.error('Update order error:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error: any) => error.message);
      return res.status(400).json({
        success: false,
        error: validationErrors.join(', ')
      });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 刪除訂單
export const deleteOrder = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const orderId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // 檢查用戶是否有權限刪除此訂單
    if (order.createdBy.toString() !== userId && user.role !== 'admin' && user.role !== 'manufacturer') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取特定 endUserCompany 的所有訂單（無權限限制，但需要用戶認證）
export const getOrdersByEndUserCompany = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // 如果是 endUser，使用其 organizationId；否則使用查詢參數
    let endUserCompanyId;
    if (user.role === 'endUser') {
      endUserCompanyId = user.organizationId;
      console.log('Debug: Using endUser organizationId:', endUserCompanyId);
    } else {
      // 其他角色可以使用查詢參數指定 endUserCompanyId
      endUserCompanyId = req.query.endUserCompanyId || user.organizationId;
    }

    if (!endUserCompanyId) {
      return res.status(400).json({ 
        success: false, 
        error: 'endUserCompanyId is required' 
      });
    }

    const { page = 1, limit = 10 } = req.query;

    console.log('Debug: Querying orders for endUserCompanyId:', endUserCompanyId);

    const query: any = {
      endUserCompanyId: endUserCompanyId
    };

    const orders = await Order.find(query)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone website taxId')
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email organizationId',
        populate: {
          path: 'organizationId',
          select: 'name type address email contactPhone website taxId'
        }
      })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await Order.countDocuments(query);

    console.log('Debug: Found orders:', orders.length);
    console.log('Debug: Total count:', total);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        pages: Math.ceil(total / +limit)
      }
    });
  } catch (err) {
    console.error('Get orders by endUserCompany error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 訂單數量狀態更新 API
// PATCH /orders/{id}/update-quantity
export const updateOrderStatus = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const orderId = req.params.id;
    // 新版：用 type 指示動作種類；相容舊版：status
    const { type, status: legacyStatus, quantity } = req.body as any;
    const action: 'in-used' | 'disposed' | undefined = type || legacyStatus;

    // 驗證輸入（以 type 為主，status 相容）
    if (!action || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'type and quantity are required; quantity must be > 0' 
      });
    }

    if (!['in-used', 'disposed'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        error: 'type must be either "in-used" or "disposed"' 
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 查找訂單
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // 檢查權限
    const isAdminOrManufacturer = user.role === 'admin' || user.role === 'manufacturer';
    const isOrderCreator = order.createdBy.toString() === userId;
    const isEndUserOfThisOrder = user.role === 'endUser'
      && user.organizationId
      && order.endUserCompanyId
      && order.endUserCompanyId.toString() === user.organizationId.toString();

    if (!isAdminOrManufacturer && !isOrderCreator && !isEndUserOfThisOrder) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 檢查訂單當前狀態
    if (order.status === 'disposed') {
      return res.status(400).json({
        success: false,
        error: 'Order is fully disposed. No further changes allowed'
      });
    }

    if (action === 'in-used' && !(order.status === 'production' || order.status === 'in-used')) {
      return res.status(400).json({ 
        success: false, 
        error: `Order must be in 'production' or 'in-used' status to transition to 'in-used'. Current status: ${order.status}` 
      });
    }

    if (action === 'disposed' && !(order.status === 'production' || order.status === 'in-used')) {
      return res.status(400).json({ 
        success: false, 
        error: `Order must be in 'production' or 'in-used' status to transition to 'disposed'. Current status: ${order.status}` 
      });
    }

    // 檢查數量是否合理
    if (quantity > order.producedQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Quantity (${quantity}) cannot exceed produced quantity (${order.producedQuantity})` 
      });
    }

    // 額外防護：pending 不允許透過此 API 變更數量
    if (order.status === 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change quantities while order is in pending status'
      });
    }

    // 計算新的數量分配
    let newInUseQuantity = order.inUseQuantity;
    let newDisposedQuantity = order.disposedQuantity;
    let newUnusedQuantity = order.unusedQuantity;

    if (action === 'in-used') {
      // 先檢查未使用數量是否足夠
      if (order.unusedQuantity < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient unused quantity. Available: ${order.unusedQuantity}, requested: ${quantity}`
        });
      }
      // 轉換到 in-used：增加 inUseQuantity，減少 unusedQuantity
      newInUseQuantity += quantity;
      newUnusedQuantity -= quantity;
    } else if (action === 'disposed') {
      // 轉換到 disposed：優先從 unusedQuantity 轉換，如果不足則從 inUseQuantity 轉換
      const fromUnused = Math.min(quantity, order.unusedQuantity);
      const needFromInUse = quantity - fromUnused;
      if (needFromInUse > order.inUseQuantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient quantity to dispose. inUse: ${order.inUseQuantity}, unused: ${order.unusedQuantity}, requested: ${quantity}`
        });
      }

      newDisposedQuantity += quantity;
      newUnusedQuantity -= fromUnused;
      newInUseQuantity -= needFromInUse;
    }

    // 驗證數量總和
    if (newInUseQuantity + newDisposedQuantity + newUnusedQuantity !== order.producedQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid quantity calculation' 
      });
    }

    // 更新訂單
    order.inUseQuantity = newInUseQuantity;
    order.disposedQuantity = newDisposedQuantity;
    order.unusedQuantity = newUnusedQuantity;
    
    // 狀態會通過 pre('save') 中間件自動更新
    await order.save();

    // 檢查是否需要創建處置報告
    if (action === 'disposed' && quantity > 0) {
      console.log('Creating disposal report for status transition...');
      try {
        await autoCreateOrderReport(orderId, userId, quantity);
        console.log('Disposal report created for status transition');
      } catch (reportError) {
        console.error('Failed to create disposal report for status transition:', reportError);
      }
    }

    // 重新查詢以獲取填充的數據
    const updatedOrder = await Order.findById(orderId)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone website taxId')
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email organizationId',
        populate: {
          path: 'organizationId',
          select: 'name type address email contactPhone website taxId'
        }
      });

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order quantities adjusted via ${action} with quantity ${quantity}`
    });

  } catch (err) {
    console.error('Update order status error:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error: any) => error.message);
      return res.status(400).json({
        success: false,
        error: validationErrors.join(', ')
      });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 簡單測試 API：檢查用戶組織信息
export const testUserAndOrders = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // 查詢所有訂單
    const allOrders = await Order.find({});
    
    // 查詢屬於該用戶組織的訂單
    const userOrders = await Order.find({ 
      endUserCompanyId: user.organizationId 
    });

    const result = {
      user: {
        id: user._id?.toString() || '',
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?.toString() || ''
      },
      orders: {
        totalOrders: allOrders.length,
        userOrders: userOrders.length,
        sampleOrders: allOrders.slice(0, 3).map(order => ({
          id: order._id?.toString() || '',
          batchNumber: order.batchNumber,
          endUserCompanyId: order.endUserCompanyId?.toString() || '',
          status: order.status
        }))
      }
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ success: false, error: 'Server error: ' + (error as Error).message });
  }
};



 