import mongoose, { Document, Schema } from 'mongoose';

export interface IModelReport extends Document {
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  modelId: mongoose.Types.ObjectId; // 關聯到 Model
  assignedTo: mongoose.Types.ObjectId; // 指派給 regulatory user
  createdBy: mongoose.Types.ObjectId;
  comment?: string; // 審核意見
  createdAt: Date;
  updatedAt: Date;
}

const modelReportSchema = new Schema<IModelReport>({
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
    ref: 'Model',
    required: true
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
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 索引
modelReportSchema.index({ modelId: 1 });
modelReportSchema.index({ assignedTo: 1 });
modelReportSchema.index({ createdBy: 1 });
modelReportSchema.index({ status: 1 });
modelReportSchema.index({ createdAt: -1 });

export default mongoose.model<IModelReport>('ModelReport', modelReportSchema); 