import Order, { IOrder } from '../models/Order';
import User from '../models/User';
import Report from '../models/Report';
import mongoose from 'mongoose';

export class OrderService {
  /**
   * 創建新的 Order
   * 只有 manufacturer role 的用戶才能創建
   */
  static async createOrder(orderData: Partial<IOrder>, userId: string) {
    // 檢查用戶是否為 manufacturer
    const user = await User.findById(userId);
    if (!user || user.role !== 'manufacturer') {
      throw new Error('Only manufacturer can create orders');
    }

    const order = new Order({
      ...orderData,
      createdBy: userId
    });
    return await order.save();
  }

  /**
   * 取得所有 Orders
   */
  static async getAllOrders(page = 1, limit = 10, search = '') {
    const query: any = {};
    if (search) {
      query.$or = [
        { batchNumber: { $regex: search, $options: 'i' } },
        { endUserCompany: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('modelId', 'modelName modelNumber')
      .populate('createdBy', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    return { orders, total, page, limit };
  }

  /**
   * 根據 ID 取得 Order
   */
  static async getOrderById(id: string) {
    return await Order.findById(id)
      .populate('modelId', 'modelName modelNumber')
      .populate('createdBy', 'firstName lastName email');
  }

  /**
   * 更新 Order
   * 只有創建者可以更新
   */
  static async updateOrder(id: string, updateData: Partial<IOrder>, userId: string) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.createdBy.toString() !== userId) {
      throw new Error('Only creator can update order');
    }

    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * 處理訂單中的器材處理 (disposal)
   * 會自動生成 disposal report
   */
  static async disposeOrderItems(orderId: string, disposeQuantity: number, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.createdBy.toString() !== userId) {
        throw new Error('Only creator can dispose order items');
      }

      if (disposeQuantity > order.inUseQuantity) {
        throw new Error('Dispose quantity cannot exceed in-use quantity');
      }

      // 更新數量
      order.inUseQuantity -= disposeQuantity;
      order.disposedQuantity += disposeQuantity;
      await order.save({ session });

      // 自動生成 disposal report
      const report = new Report({
        reportType: 'disposal',
        title: `Disposal Report: ${order.batchNumber}`,
        description: `Disposed ${disposeQuantity} items from order ${order.batchNumber}`,
        orderId: order._id,
        assignedTo: null, // 需要指派給 regulatory user
        createdBy: userId
      });
      await report.save({ session });

      await session.commitTransaction();
      return { order, report };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * 根據 manufacturer 取得 Orders
   */
  static async getOrdersByManufacturer(manufacturerId: string) {
    return await Order.find({ createdBy: manufacturerId })
      .populate('modelId', 'modelName modelNumber')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * 刪除 Order
   * 只有創建者可以刪除
   */
  static async deleteOrder(id: string, userId: string) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.createdBy.toString() !== userId) {
      throw new Error('Only creator can delete order');
    }

    return await Order.findByIdAndDelete(id);
  }
} 