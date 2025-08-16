const mongoose = require('mongoose');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');

// 定義 Order Schema
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

const Order = mongoose.model('Order', OrderSchema);

async function testOrderStatusTransition() {
  try {
    console.log('🧪 測試訂單狀態自動轉換邏輯...\n');
    
    // 創建測試訂單
    const testOrder = new Order({
      modelId: new mongoose.Types.ObjectId(),
      batchNumber: `TEST-BATCH-${Date.now()}`,
      endUserCompanyId: new mongoose.Types.ObjectId(),
      status: 'pending',
      producedQuantity: 100,
      inUseQuantity: 0,
      disposedQuantity: 0,
      unusedQuantity: 100,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    console.log('📝 創建測試訂單...');
    await testOrder.save();
    console.log(`✅ 訂單創建成功: ${testOrder.batchNumber}, 狀態: ${testOrder.status}`);
    
    // 測試1: pending → production (手動更新)
    console.log('\n🔄 測試1: pending → production');
    testOrder.status = 'production';
    await testOrder.save();
    console.log(`✅ 狀態更新為: ${testOrder.status}`);
    
    // 測試2: production → in-used (當 inUseQuantity > 0)
    console.log('\n🔄 測試2: production → in-used (當 inUseQuantity > 0)');
    testOrder.inUseQuantity = 30;
    testOrder.unusedQuantity = 70;
    await testOrder.save();
    console.log(`✅ 狀態自動轉換為: ${testOrder.status}`);
    
    // 測試3: in-used → disposed (當 disposedQuantity = producedQuantity)
    console.log('\n🔄 測試3: in-used → disposed (當 disposedQuantity = producedQuantity)');
    testOrder.disposedQuantity = 100;
    testOrder.inUseQuantity = 0;
    testOrder.unusedQuantity = 0;
    await testOrder.save();
    console.log(`✅ 狀態自動轉換為: ${testOrder.status}`);
    
    // 測試4: 創建另一個訂單測試部分處置
    console.log('\n🔄 測試4: 部分處置情況');
    const testOrder2 = new Order({
      modelId: new mongoose.Types.ObjectId(),
      batchNumber: `TEST-BATCH-2-${Date.now()}`,
      endUserCompanyId: new mongoose.Types.ObjectId(),
      status: 'production',
      producedQuantity: 200,
      inUseQuantity: 50,
      disposedQuantity: 30,
      unusedQuantity: 120,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await testOrder2.save();
    console.log(`✅ 訂單2創建成功: ${testOrder2.batchNumber}, 狀態: ${testOrder2.status}`);
    
    // 更新使用數量，應該轉換為 in-used
    testOrder2.inUseQuantity = 80;
    testOrder2.unusedQuantity = 90;
    await testOrder2.save();
    console.log(`✅ 訂單2狀態轉換為: ${testOrder2.status}`);
    
    console.log('\n🎉 所有測試完成！');
    
    // 清理測試數據
    await Order.deleteMany({ batchNumber: { $regex: /^TEST-BATCH/ } });
    console.log('🧹 測試數據已清理');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testOrderStatusTransition(); 