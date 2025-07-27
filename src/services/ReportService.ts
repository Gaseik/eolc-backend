import Report, { IReport } from '../models/Report';
import User from '../models/User';
import mongoose from 'mongoose';

export class ReportService {
  /**
   * 取得所有 Reports
   */
  static async getAllReports(page = 1, limit = 10, type?: string, status?: string) {
    const query: any = {};
    
    if (type) {
      query.reportType = type;
    }
    
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('modelId', 'modelName modelNumber')
      .populate('orderId', 'batchNumber')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    return { reports, total, page, limit };
  }

  /**
   * 根據 ID 取得 Report
   */
  static async getReportById(id: string) {
    return await Report.findById(id)
      .populate('modelId', 'modelName modelNumber')
      .populate('orderId', 'batchNumber')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
  }

  /**
   * 更新 Report 狀態
   * 只有 regulator 可以更新狀態
   */
  static async updateReportStatus(id: string, status: string, userId: string) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'regulator') {
      throw new Error('Only regulator can update report status');
    }

    const report = await Report.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    return await Report.findByIdAndUpdate(id, { status }, { new: true });
  }

  /**
   * 指派 Report 給 regulator user
   */
  static async assignReport(id: string, assignedToId: string, userId: string) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'regulator') {
      throw new Error('Only regulator can assign reports');
    }

    const assignedTo = await User.findById(assignedToId);
    if (!assignedTo || assignedTo.role !== 'regulator') {
      throw new Error('Can only assign to regulator users');
    }

    return await Report.findByIdAndUpdate(id, { assignedTo: assignedToId }, { new: true });
  }

  /**
   * 根據 regulatory user 取得分配的 Reports
   */
  static async getReportsByRegulatory(regulatoryId: string) {
    return await Report.find({ assignedTo: regulatoryId })
      .populate('modelId', 'modelName modelNumber')
      .populate('orderId', 'batchNumber')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * 根據 Model 取得相關的 Reports
   */
  static async getReportsByModel(modelId: string) {
    return await Report.find({ modelId, reportType: 'model' })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * 根據 Order 取得相關的 Reports
   */
  static async getReportsByOrder(orderId: string) {
    return await Report.find({ orderId, reportType: 'disposal' })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * 刪除 Report
   * 只有創建者可以刪除
   */
  static async deleteReport(id: string, userId: string) {
    const report = await Report.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    if (report.createdBy.toString() !== userId) {
      throw new Error('Only creator can delete report');
    }

    return await Report.findByIdAndDelete(id);
  }
} 