import Model, { IModel } from '../models/Model';
import User from '../models/User';
import Report from '../models/Report';
import mongoose from 'mongoose';

export class ModelService {
  /**
   * 創建新的 Model
   * 只有 manufacturer role 的用戶才能創建
   * 創建後自動生成 model report
   */
  static async createModel(modelData: Partial<IModel>, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 檢查用戶是否為 manufacturer
      const user = await User.findById(userId);
      if (!user || user.role !== 'manufacturer') {
        throw new Error('Only manufacturer can create models');
      }

      // 創建 model
      const model = new Model({
        ...modelData,
        createdBy: userId
      });
      await model.save({ session });

      // 自動生成 model report
      const report = new Report({
        reportType: 'model',
        title: `Model Report: ${model.modelName}`,
        description: `Auto-generated report for model ${model.modelNumber}`,
        modelId: model._id,
        assignedTo: null, // 需要指派給 regulatory user
        createdBy: userId
      });
      await report.save({ session });

      await session.commitTransaction();
      return { model, report };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * 取得所有 Models
   */
  static async getAllModels(page = 1, limit = 10, search = '') {
    const query: any = {};
    if (search) {
      query.$or = [
        { modelName: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const models = await Model.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Model.countDocuments(query);

    return { models, total, page, limit };
  }

  /**
   * 根據 ID 取得 Model
   */
  static async getModelById(id: string) {
    return await Model.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');
  }

  /**
   * 更新 Model
   * 只有創建者或 regulatory 可以更新
   */
  static async updateModel(id: string, updateData: Partial<IModel>, userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const model = await Model.findById(id);
    if (!model) {
      throw new Error('Model not found');
    }

    // 檢查權限：創建者或 regulatory 可以更新
    if (model.createdBy.toString() !== userId && user.role !== 'regulatory') {
      throw new Error('Unauthorized to update this model');
    }

    // 如果是 regulatory 更新，設置 approvedBy
    if (user.role === 'regulatory') {
      updateData.approvedBy = userId;
    }

    return await Model.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * 刪除 Model
   * 只有創建者可以刪除
   */
  static async deleteModel(id: string, userId: string) {
    const model = await Model.findById(id);
    if (!model) {
      throw new Error('Model not found');
    }

    if (model.createdBy.toString() !== userId) {
      throw new Error('Only creator can delete model');
    }

    return await Model.findByIdAndDelete(id);
  }

  /**
   * 根據 manufacturer 取得 Models
   */
  static async getModelsByManufacturer(manufacturerId: string) {
    return await Model.find({ createdBy: manufacturerId })
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }
} 