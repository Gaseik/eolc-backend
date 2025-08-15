const mongoose = require('mongoose');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');

// 定義 Order Schema（與主應用相同）
const OrderSchema = new mongoose.Schema({
  modelId: mongoose.Schema.Types.ObjectId,
  batchNumber: String,
  endUserCompanyId: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ['pending', 'production', 'in-used', 'disposed'],
    default: 'pending'
  },
  producedQuantity: Number,
  inUseQuantity: Number,
  disposedQuantity: Number,
  unusedQuantity: Number,
  createdBy: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

// 自動狀態轉換邏輯
OrderSchema.pre('save', function(next) {
  console.log('🔄 Pre-save hook triggered');
  console.log(`   Current status: ${this.status}`);
  console.log(`   inUseQuantity: ${this.inUseQuantity}`);
  console.log(`   disposedQuantity: ${this.disposedQuantity}`);
  console.log(`   producedQuantity: ${this.producedQuantity}`);
  
  // 如果正在更新數量，檢查是否需要自動轉換狀態
  if (this.isModified('inUseQuantity') || this.isModified('disposedQuantity')) {
    console.log('   Quantity fields modified, checking status transition...');
    
    // 規則1: 如果 inUseQuantity > 0，狀態應該是 in-used
    if (this.inUseQuantity > 0 && this.status === 'production') {
      this.status = 'in-used';
      console.log(`   ✅ Status auto-changed to 'in-used' (inUseQuantity: ${this.inUseQuantity})`);
    }
    
    // 規則2: 如果 disposedQuantity = producedQuantity，狀態應該是 disposed
    if (this.disposedQuantity === this.producedQuantity && this.producedQuantity > 0) {
      this.status = 'disposed';
      console.log(`   ✅ Status auto-changed to 'disposed' (disposedQuantity: ${this.disposedQuantity} = producedQuantity: ${this.producedQuantity})`);
    }
  }
  
  next();
});

const Order = mongoose.model('Order', OrderSchema);

async function testStatusTransition() {
  try {
    console.log('🧪 測試訂單狀態自動轉換邏輯...\n');
    
    // 查找現有訂單
    const existingOrder = await Order.findOne({ batchNumber: 'TEST-ENDUSER-ORDER' });
    if (!existingOrder) {
      console.log('❌ 找不到測試訂單');
      return;
    }
    
    console.log(`📝 找到訂單: ${existingOrder.batchNumber}`);
    console.log(`   當前狀態: ${existingOrder.status}`);
    console.log(`   inUseQuantity: ${existingOrder.inUseQuantity}`);
    console.log(`   disposedQuantity: ${existingOrder.disposedQuantity}`);
    
    // 測試狀態轉換
    console.log('\n🔄 測試狀態轉換...');
    existingOrder.inUseQuantity = 70;
    existingOrder.unusedQuantity = 30;
    
    console.log('   保存訂單...');
    await existingOrder.save();
    
    console.log(`✅ 更新後狀態: ${existingOrder.status}`);
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testStatusTransition(); 