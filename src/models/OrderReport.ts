import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderReport extends Document {
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  orderId: mongoose.Types.ObjectId; // 關聯到 Order
  assignedTo: mongoose.Types.ObjectId; // 指派給 regulatory user
  createdBy: mongoose.Types.ObjectId;
  comment?: string; // 審核意見
  disposalQuantity: number; // 處置數量
  disposalMethod?: string; // 處置方法
  evidenceLinks?: string[]; // 證據連結（純連結）
  materials?: Array<{
    materialKey: string;
    wasteStreamClassification: string[];
    labellingAndPackaging: string[];
    transportationAndStorage: string;
    condition: string[];
    disposalMethod: string[];
    attachments: Array<{ fileId: string; fileName: string; mimeType: string }>
  }>;
  notes?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 簡單 URL 驗證器
const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const orderReportSchema = new Schema<IOrderReport>({
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
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
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
  },
  disposalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  disposalMethod: {
    type: String,
    trim: true
  },
  evidenceLinks: {
    type: [String],
    validate: {
      validator: function(values: string[]) {
        if (!Array.isArray(values)) return false;
        return values.every((v) => typeof v === 'string' && v.trim() !== '' && isValidUrl(v));
      },
      message: 'Invalid URL in evidenceLinks'
    },
    required: false
  },
  materials: {
    type: [
      new Schema({
        materialKey: { type: String, required: true, trim: true },
        wasteStreamClassification: { type: [String], default: [] },
        labellingAndPackaging: { type: [String], default: [] },
        transportationAndStorage: { type: String, default: '' },
        condition: { type: [String], default: [] },
        disposalMethod: { type: [String], default: [] },
        attachments: {
          type: [
            new Schema({
              fileId: { type: String, required: true, trim: true },
              fileName: { type: String, required: true, trim: true },
              mimeType: { type: String, required: true, trim: true }
            }, { _id: false })
          ],
          default: []
        }
      }, { _id: false })
    ],
    required: false,
    default: undefined
  },
  notes: { type: String, trim: true },
  submittedAt: { type: Date }
}, {
  timestamps: true
});

// 索引
orderReportSchema.index({ orderId: 1 });
orderReportSchema.index({ assignedTo: 1 });
orderReportSchema.index({ createdBy: 1 });
orderReportSchema.index({ status: 1 });
orderReportSchema.index({ createdAt: -1 });

export default mongoose.model<IOrderReport>('OrderReport', orderReportSchema); 