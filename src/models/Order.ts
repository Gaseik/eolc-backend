import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  modelId: mongoose.Types.ObjectId;
  batchNumber: string;
  endUserCompanyId: mongoose.Types.ObjectId; // 關聯到 Organization
  status: 'pending' | 'in_production' | 'completed' | 'disposed';
  producedQuantity: number;
  inUseQuantity: number;
  disposedQuantity: number;
  unusedQuantity: number;
  createdBy: mongoose.Types.ObjectId; // 只能是 manufacturer role
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'Model',
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  endUserCompanyId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_production', 'completed', 'disposed'],
    default: 'pending'
  },
  producedQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  inUseQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  disposedQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unusedQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 驗證：數量總和必須等於生產數量
orderSchema.pre('save', function(next) {
  const total = this.inUseQuantity + this.disposedQuantity + this.unusedQuantity;
  if (total !== this.producedQuantity) {
    return next(new Error('Quantity sum must equal produced quantity'));
  }
  next();
});

// 索引
orderSchema.index({ batchNumber: 1 });
orderSchema.index({ modelId: 1 });
orderSchema.index({ endUserCompanyId: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', orderSchema); 