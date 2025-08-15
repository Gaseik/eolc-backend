import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  modelId: mongoose.Types.ObjectId;
  batchNumber: string;
  endUserCompanyId: mongoose.Types.ObjectId; // 關聯到 Organization
  status: 'pending' | 'production' | 'in-used' | 'disposed';
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
    enum: ['pending', 'production', 'in-used', 'disposed'],
    default: 'production'
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

// 驗證：
// 1) pending 狀態不得有 inUse 或 disposed 的數量，且 unused 必須等於 produced
// 2) 數量總和必須等於 producedQuantity
orderSchema.pre('save', function(next) {
  // 規則 1：pending 不允許任何使用/處置數量變更
  if (this.status === 'pending') {
    const hasInvalidPendingQuantities = this.inUseQuantity !== 0 || this.disposedQuantity !== 0 || this.unusedQuantity !== this.producedQuantity;
    if (hasInvalidPendingQuantities) {
      return next(new Error('Pending orders cannot have in-use or disposed quantities; unused must equal produced quantity'));
    }
  }

  // 規則 2：三種數量加總需等於 produced
  const total = this.inUseQuantity + this.disposedQuantity + this.unusedQuantity;
  if (total !== this.producedQuantity) {
    return next(new Error('Quantity sum must equal produced quantity'));
  }
  next();
});

// 自動狀態轉換邏輯
orderSchema.pre('save', function(next) {
  // 如果正在更新數量，檢查是否需要自動轉換狀態
  if (this.isModified('inUseQuantity') || this.isModified('disposedQuantity')) {
    
    // 規則1: 如果 inUseQuantity > 0，狀態應該是 in-used
    if (this.inUseQuantity > 0 && this.status === 'production') {
      this.status = 'in-used';
      console.log(`Order ${this.batchNumber} status auto-changed to 'in-used' (inUseQuantity: ${this.inUseQuantity})`);
    }
    
    // 規則2: 如果 disposedQuantity = producedQuantity，狀態應該是 disposed
    if (this.disposedQuantity === this.producedQuantity && this.producedQuantity > 0) {
      this.status = 'disposed';
      console.log(`Order ${this.batchNumber} status auto-changed to 'disposed' (disposedQuantity: ${this.disposedQuantity} = producedQuantity: ${this.producedQuantity})`);
    }
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