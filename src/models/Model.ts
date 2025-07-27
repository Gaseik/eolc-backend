import mongoose, { Document, Schema } from 'mongoose';

export interface IModel extends Document {
  modelName: string;
  modelNumber: string;
  manufacturingDate: Date;
  expireDate: Date;
  description: string;
  relevantStandard: string; // ISO 10993, ISO 13485, ISO 14971, IEC 606901
  class: string; // Non Invasive I, II A, II B, Invasive I, II A, II B
  intendedUse: string;
  materialBreakdown: string;
  barcode: string;
  hazardousSubstances: string;
  createdBy: mongoose.Types.ObjectId; // 只能是 manufacturer role
  approvedBy?: mongoose.Types.ObjectId; // 只能是 regulatory role
  createdAt: Date;
  updatedAt: Date;
}

const modelSchema = new Schema<IModel>({
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  modelNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  expireDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relevantStandard: {
    type: String,
    required: true,
    enum: ['ISO 10993', 'ISO 13485', 'ISO 14971', 'IEC 606901']
  },
  class: {
    type: String,
    required: true,
    enum: [
      'Non Invasive I',
      'Non Invasive II A', 
      'Non Invasive II B',
      'Invasive I',
      'Invasive II A',
      'Invasive II B'
    ]
  },
  intendedUse: {
    type: String,
    required: true
  },
  materialBreakdown: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    trim: true
  },
  hazardousSubstances: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引 (移除 modelNumber 因為 schema 中已經有 unique: true)
modelSchema.index({ createdBy: 1 });
modelSchema.index({ approvedBy: 1 });

export default mongoose.model<IModel>('Model', modelSchema); 