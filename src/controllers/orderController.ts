import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Model from '../models/Model';
import User from '../models/User';
import Organization from '../models/Organization';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user?: { id: string; email: string; role: string };
}

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 訂單管理 API
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
      status: 'pending'
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
export const getOrders = async (req: RequestWithUser, res: Response) => {
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
      // 只查詢自己創建的訂單
      query.createdBy = userId;
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
    if (order.createdBy.toString() !== userId && user.role !== 'admin' && user.role !== 'manufacturer') {
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
    if (order.createdBy.toString() !== userId && user.role !== 'admin' && user.role !== 'manufacturer') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // 如果更新數量，驗證總和
    if (req.body.inUseQuantity !== undefined || req.body.disposedQuantity !== undefined || req.body.unusedQuantity !== undefined) {
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

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('modelId', 'modelName modelNumber')
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

 