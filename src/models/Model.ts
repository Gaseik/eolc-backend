import mongoose, { Schema, Document } from 'mongoose';

export interface IModel extends Document {
  // === 基本資訊 ===
  modelName: string;
  modelNumber: string;
  batchNumber: string; // 後端自動產生的批次號
  description?: string;
  
  // === 日期資訊 ===
  manufactureDate?: Date;
  expirationDate?: Date;
  
  // === 分類和標準 ===
  standards: string[];
  classes: string[];
  intendedUseCategories: string;
  intendedUse?: string;
  
  // === 材料組成 ===
  materialComposition?: {
    materials: string[];
    hazardousSubstances: string[];
  };
  
  // === 廢物管理 ===
  wasteManagement?: {
    wasteStreamClassification: string[];
    labellingAndPackaging: string[];
    transportationAndStorage?: string;
  };
  
  // === 法律文件 ===
  disclaimer?: string;
  
  // === 審核資訊 ===
  approvers: {
    id: mongoose.Types.ObjectId;
    permission: string;
  }[];
  
  // === 元數據 ===
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema = new Schema<IModel>({
  // === 基本資訊 ===
  modelName: { type: String, required: true },
  modelNumber: { type: String, required: true },
  batchNumber: { type: String, unique: true }, // 批次號，後端自動產生
  description: { type: String },
  
  // === 日期資訊 ===
  manufactureDate: { type: Date },
  expirationDate: { type: Date },
  
  // === 分類和標準 ===
  standards: [{ type: String, required: true }],
  classes: [{ type: String, required: true }],
  intendedUseCategories: { type: String, required: true },
  intendedUse: { type: String },
  
  // === 材料組成 ===
  materialComposition: {
    materials: [{ type: String }],
    hazardousSubstances: [{ type: String }]
  },
  
  // === 廢物管理 ===
  wasteManagement: {
    wasteStreamClassification: [{ type: String }],
    labellingAndPackaging: [{ type: String }],
    transportationAndStorage: { type: String }
  },
  
  // === 法律文件 ===
  disclaimer: { type: String },
  
  // === 審核資訊 ===
  approvers: [{
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, required: true }
  }],
  
  // === 元數據 ===
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 預保存中間件：自動產生 batchNumber
ModelSchema.pre('save', async function(next) {
  if (this.isNew && !this.batchNumber) {
    // 產生格式：BATCH-YYYYMMDD-XXXX (XXXX 是序號)
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    // 查找今天的批次數量
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayBatchCount = await mongoose.model('Model').countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const sequence = (todayBatchCount + 1).toString().padStart(4, '0');
    this.batchNumber = `BATCH-${dateStr}-${sequence}`;
  }
  next();
});

export default mongoose.model<IModel>('Model', ModelSchema); 