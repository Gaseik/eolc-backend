import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reportType: 'model' | 'disposal';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  modelId?: mongoose.Types.ObjectId; // 僅 model report 使用
  orderId?: mongoose.Types.ObjectId; // 僅 disposal report 使用
  assignedTo: mongoose.Types.ObjectId; // 指派給 regulatory user
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  reportType: {
    type: String,
    enum: ['model', 'disposal'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'Model'
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 驗證：根據 reportType 決定必須的欄位
reportSchema.pre('save', function(next) {
  if (this.reportType === 'model') {
    if (!this.modelId) {
      return next(new Error('Model report must have modelId'));
    }
    if (this.orderId) {
      return next(new Error('Model report cannot have orderId'));
    }
  } else if (this.reportType === 'disposal') {
    if (!this.orderId) {
      return next(new Error('Disposal report must have orderId'));
    }
    if (this.modelId) {
      return next(new Error('Disposal report cannot have modelId'));
    }
  }
  next();
});

// 索引
reportSchema.index({ reportType: 1 });
reportSchema.index({ modelId: 1 });
reportSchema.index({ orderId: 1 });
reportSchema.index({ assignedTo: 1 });
reportSchema.index({ createdBy: 1 });
reportSchema.index({ status: 1 });

export default mongoose.model<IReport>('Report', reportSchema); 