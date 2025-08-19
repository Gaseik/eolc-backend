import { Request, Response } from 'express';
import ModelReport, { IModelReport } from '../models/ModelReport';
import Model from '../models/Model';
import User from '../models/User';
import Order from '../models/Order';

interface RequestWithUser extends Request {
  user?: { id: string; email: string; role: string };
}

// Create model report
export const createModelReport = async (req: RequestWithUser, res: Response) => {
  try {
    const { title, description, modelId, assignedTo } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate required fields
    if (!title || !description || !modelId || !assignedTo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, description, modelId, assignedTo' 
      });
    }

    // Check if assigned user exists and has regulatory role
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

    // Check if model exists
    const model = await Model.findById(modelId);
    if (!model) {
      return res.status(400).json({ 
        success: false, 
        error: 'Model not found' 
      });
    }

    // Create report
    const report = await ModelReport.create({
      title,
      description,
      modelId,
      assignedTo,
      createdBy: userId
    });

    // Return detailed information
    const populatedReport = await ModelReport.findById(report._id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .populate('modelId', 'modelName modelNumber batchNumber');

    res.status(201).json({
      success: true,
      data: populatedReport,
      message: 'Model report created successfully'
    });
  } catch (err) {
    console.error('Create model report error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get model report list
// GET /model-reports
export const getModelReports = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    // Build query conditions
    const query: any = {};

    // Filter by user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'regulator') {
      // Regulatory users can see all reports (for review)
      // No filtering conditions added
    } else if (user.role === 'manufacturer') {
      // Manufacturer 用戶可以看到組織內的所有報告
      if (user.organizationId) {
        // 查找同組織內所有用戶創建的報告
        const orgUsers = await User.find({ organizationId: user.organizationId }).select('_id');
        const orgUserIds = orgUsers.map(u => u._id);
        query.createdBy = { $in: orgUserIds };
      } else {
        // 如果沒有組織ID，只能看到自己的報告
        query.createdBy = userId;
      }
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
    const reports = await ModelReport.find(query)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .populate('modelId', 'modelName modelNumber batchNumber')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // 獲取總數
    const total = await ModelReport.countDocuments(query);

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
    console.error('Get model reports error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取單個模型報告
// GET /model-reports/:id
export const getModelReportById = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const report = await ModelReport.findById(id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .populate({
        path: 'modelId',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName email'
        }
      });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Model report not found' });
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

    // 構建響應數據，包含完整的模型資訊
    const responseData = {
      ...report.toObject(),
      modelDetails: report.modelId // 包含完整的模型資訊
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (err) {
    console.error('Get model report by ID error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 更新模型報告狀態
// PATCH /model-reports/:id/status
export const updateModelReportStatus = async (req: RequestWithUser, res: Response) => {
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

    const report = await ModelReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Model report not found' });
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
    const updatedReport = await ModelReport.findByIdAndUpdate(
      id,
      { 
        status,
        ...(comment && { comment })
      },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email role')
     .populate('createdBy', 'firstName lastName email role')
     .populate('modelId', 'modelName modelNumber batchNumber');

    // 如果報告被批准，自動更新對應的模型狀態為 published
    if (status === 'approved' && report.modelId) {
      try {
        // 更新模型狀態為 published
        await Model.findByIdAndUpdate(report.modelId, { status: 'published' });
        console.log(`Model ${report.modelId} status updated to published after report approval`);
      } catch (modelUpdateError) {
        console.error('Failed to update model status after report approval:', modelUpdateError);
        // 不中斷流程，只記錄錯誤
      }
    }

    res.json({
      success: true,
      data: updatedReport,
      message: 'Model report status updated successfully'
    });
  } catch (err) {
    console.error('Update model report status error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 刪除模型報告
export const deleteModelReport = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const report = await ModelReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Model report not found' });
    }

    // 檢查權限 - 只有創建者或 admin 可以刪除
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role !== 'admin' && report.createdBy._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await ModelReport.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Model report deleted successfully'
    });
  } catch (err) {
    console.error('Delete model report error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 自動創建模型報告（當模型被創建時調用）
export const autoCreateModelReport = async (modelId: string, createdBy: string) => {
  try {
    console.log('Auto create model report called with:', { modelId, createdBy });
    
    // 找到一個可用的 regulatory 用戶
    const regulatoryUser = await User.findOne({ role: 'regulator' });
    if (!regulatoryUser) {
      console.error('No regulatory user found for model report assignment');
      return null;
    }
    console.log('Found regulatory user:', regulatoryUser._id);

    const model = await Model.findById(modelId);
    if (!model) {
      console.error('Model not found for report creation');
      return null;
    }
    console.log('Found model:', model.modelName);

    const report = await ModelReport.create({
      title: `Model Review: ${model.modelName} (${model.modelNumber})`,
      description: `New model ${model.modelName} (${model.modelNumber}) requires regulatory review. Batch: ${model.batchNumber}`,
      modelId,
      assignedTo: regulatoryUser._id,
      createdBy
    });

    console.log(`Model report created successfully: ${report._id}`);
    return report;
  } catch (err) {
    console.error('Auto create model report error:', err);
    return null;
  }
}; 