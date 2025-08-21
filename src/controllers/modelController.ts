import { Request, Response } from 'express';
import Model from '../models/Model';
import User from '../models/User';
import Organization from '../models/Organization';

// 在檔案最上方加上 Express Request 型別擴充
import { Request as ExpressRequest } from 'express';
import mongoose from 'mongoose';
import { autoCreateModelReport } from './modelReportController';

interface RequestWithUser extends ExpressRequest {
  user?: { _id: any };
}

/**
 * @swagger
 * tags:
 *   name: Models
 *   description: Device Model Management API
 */

// 創建設備模型
export const createModel = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      modelName,
      modelNumber,
      description,
      manufactureDate,
      expirationDate,
      standards,
      classes,
      intendedUseCategories,
      intendedUse,
      materialComposition,
      wasteManagement,
      disclaimer,
      approvers,
      status = 'draft'
    } = req.body;

    // 驗證必填欄位
    if (!modelName || !modelNumber || !standards || !classes || !intendedUseCategories || !approvers) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: modelName, modelNumber, standards, classes, intendedUseCategories, approvers' 
      });
    }

    // 檢查 approvers 是否為空陣列
    if (!Array.isArray(approvers) || approvers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Approvers array cannot be empty. At least one approver is required.' 
      });
    }

    // 檢查用戶是否存在
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 檢查用戶是否屬於組織
    if (!user.organizationId) {
      return res.status(400).json({ success: false, error: 'User does not belong to any organization' });
    }

    // 檢查組織是否存在
    const organization = await Organization.findById(user.organizationId);
    if (!organization) return res.status(404).json({ success: false, error: 'Organization not found' });

    // 檢查 modelNumber 是否已存在（在同一組織內）
    const existingModel = await Model.findOne({ 
      modelNumber, 
      organizationId: user.organizationId 
    });
    if (existingModel) {
      return res.status(400).json({ success: false, error: 'Model number already exists in your organization' });
    }

    // 處理 approvers，驗證並轉換 ObjectId
    const processedApprovers = [];
    for (const approver of approvers) {
      // 檢查是否為有效的 ObjectId 格式
      if (!mongoose.Types.ObjectId.isValid(approver.id)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid approver ID format: ${approver.id}. Must be a valid ObjectId.` 
        });
      }
      
      // 檢查用戶是否存在
      const approverUser = await User.findById(approver.id);
      if (!approverUser) {
        return res.status(400).json({ 
          success: false, 
          error: `Approver user not found: ${approver.id}` 
        });
      }
      
      processedApprovers.push({
        id: new mongoose.Types.ObjectId(approver.id),
        permission: approver.permission
      });
    }

    // 創建模型（使用 new Model() 和 save() 來觸發預保存中間件）
    const model = new Model({
      modelName,
      modelNumber,
      description,
      manufactureDate: manufactureDate ? new Date(manufactureDate) : undefined,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      standards,
      classes,
      intendedUseCategories,
      intendedUse,
      materialComposition,
      wasteManagement,
      disclaimer,
      approvers: processedApprovers,
      organizationId: user.organizationId,
      createdBy: userId,
      status
    });

    await model.save();

    // 自動創建模型報告
    try {
      await autoCreateModelReport(model._id?.toString() || '', userId);
    } catch (reportError) {
      console.error('Failed to create model report:', reportError);
      // 不中斷創建流程，只記錄錯誤
    }

    res.status(201).json({
      success: true,
      data: model
    });
  } catch (err) {
    console.error('Create model error:', err);
    
    // 處理 MongoDB 重複鍵錯誤
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      return res.status(400).json({ 
        success: false, 
        error: `${field} '${value}' already exists in your organization` 
      });
    }
    
    // 處理 Mongoose 驗證錯誤
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error: any) => error.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
};

// 獲取所有模型（分頁）
export const getModels = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { page = 1, limit = 10, search = '', status, scope = 'my' } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 構建查詢條件
    const query: any = {};
    
    // 根據 scope 參數決定查詢範圍
    if (scope === 'my') {
      // 只查詢自己組織的模型
      query.organizationId = user.organizationId;
    } else if (scope === 'all') {
      // 查詢所有組織的模型（需要適當權限）
      if (user.role !== 'admin' && user.role !== 'regulator') {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. Only admin and regulator can view all models.' 
        });
      }
      // 不添加 organizationId 限制，查詢所有模型
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid scope parameter. Use "my" or "all".' 
      });
    }
    
    if (search) {
      query.$or = [
        { modelName: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const models = await Model.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvers.id', 'firstName lastName email')
      .populate('organizationId', 'name')
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await Model.countDocuments(query);

    // 重構響應數據，將 organizationId 重命名為 organization
    const responseData = models.map(model => {
      const modelObj = model.toObject() as any;
      modelObj.organization = modelObj.organizationId;
      delete modelObj.organizationId;
      return modelObj;
    });

    res.json({
      success: true,
      data: responseData,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        pages: Math.ceil(total / +limit)
      }
    });
  } catch (err) {
    console.error('Get models error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取單一模型
export const getModelById = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const modelId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const model = await Model.findById(modelId)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvers.id', 'firstName lastName email')
      .populate('organizationId', 'name type address taxId email contactPhone website');

    if (!model) return res.status(404).json({ success: false, error: 'Model not found' });

    // 檢查用戶是否有權限查看此模型
    const modelOrgId = model.organizationId._id ? model.organizationId._id.toString() : model.organizationId.toString();
    const userOrgId = user.organizationId?.toString();
    
    // 權限檢查邏輯
    const canView = 
      user.role === 'regulator' || // regulatory 用戶可以查看所有模型（用於審核）
      user.role === 'admin' || // admin 可以查看所有模型
      user.role === 'manufacturer' && modelOrgId === userOrgId || // manufacturer 可以查看自己組織的模型
      user.role === 'endUser'; // endUser 可以查看所有模型（因為需要查看訂單相關的模型）
    
    if (!canView) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 重構響應數據，將 organizationId 重命名為 organization
    const responseData = model.toObject() as any;
    responseData.organization = responseData.organizationId;
    delete responseData.organizationId;
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (err) {
    console.error('Get model by id error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 更新模型
export const updateModel = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const modelId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const model = await Model.findById(modelId);
    if (!model) return res.status(404).json({ success: false, error: 'Model not found' });

    // 檢查用戶是否有權限更新此模型
    if (model.organizationId.toString() !== user.organizationId?.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 只允許創建者或具有編輯權限的審核者更新
    const canEdit = model.createdBy.toString() === userId || 
                   model.approvers.some(approver => 
                     approver.id.toString() === userId && 
                     ['Full Access', 'Can Edit'].includes(approver.permission)
                   );

    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'No permission to edit this model' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // 處理日期欄位
    if (req.body.manufactureDate) {
      updateData.manufactureDate = new Date(req.body.manufactureDate);
    }
    if (req.body.expirationDate) {
      updateData.expirationDate = new Date(req.body.expirationDate);
    }

    const updatedModel = await Model.findByIdAndUpdate(
      modelId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('approvers.id', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedModel
    });
  } catch (err) {
    console.error('Update model error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 刪除模型
export const deleteModel = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const modelId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const model = await Model.findById(modelId);
    if (!model) return res.status(404).json({ success: false, error: 'Model not found' });

    // 檢查用戶是否有權限刪除此模型
    if (model.organizationId.toString() !== user.organizationId?.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // 只允許創建者刪除
    if (model.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Only the creator can delete this model' });
    }

    await Model.findByIdAndDelete(modelId);

    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (err) {
    console.error('Delete model error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 

// 獲取可用的審核者列表
export const getAvailableApprovers = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // 檢查用戶是否存在
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 檢查用戶是否屬於組織
    if (!user.organizationId) {
      return res.status(400).json({ success: false, error: 'User does not belong to any organization' });
    }

    // 獲取同一組織的所有用戶
    const approvers = await User.find({ 
      organizationId: user.organizationId,
      _id: { $ne: userId } // 排除自己
    }).select('_id firstName lastName email role');

    res.status(200).json({
      success: true,
      data: approvers.map(approver => ({
        id: approver._id,
        name: `${approver.firstName} ${approver.lastName}`,
        email: approver.email,
        role: approver.role
      }))
    });
  } catch (err) {
    console.error('Get approvers error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 

 