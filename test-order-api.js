const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function testOrderApi() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 測試參數
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com (manufacturer)
    const modelId = '68880f43d6999e323f7aa18c'; // 現有的模型

    console.log('=== Testing Order API ===');
    console.log(`User ID: ${userId}`);
    console.log(`Model ID: ${modelId}`);

    // 檢查用戶
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log(`✅ User found: ${user.email} (${user.role})`);

    // 檢查模型
    const model = await mongoose.model('Model').findById(modelId);
    if (!model) {
      console.log('❌ Model not found');
      return;
    }
    console.log(`✅ Model found: ${model.modelName}`);

    // 檢查現有訂單
    const existingOrders = await mongoose.model('Order').find({});
    console.log(`\nExisting orders: ${existingOrders.length}`);
    
    if (existingOrders.length > 0) {
      console.log('Sample order:');
      console.log(`  ID: ${existingOrders[0]._id}`);
      console.log(`  Batch Number: ${existingOrders[0].batchNumber}`);
      console.log(`  Status: ${existingOrders[0].status}`);
      console.log(`  End User Company: ${existingOrders[0].endUserCompany}`);
    }

    // 測試創建訂單的數據
    const testOrderData = {
      modelId: modelId,
      batchNumber: `TEST-BATCH-${Date.now()}`,
      endUserCompany: 'Test Company Ltd.',
      producedQuantity: 100
    };

    console.log('\n=== Test Order Data ===');
    console.log('Order data:', testOrderData);

    // 驗證初始數量分配
    console.log(`Initial quantity allocation:`);
    console.log(`  Produced: ${testOrderData.producedQuantity}`);
    console.log(`  In Use: 0 (initial)`);
    console.log(`  Disposed: 0 (initial)`);
    console.log(`  Unused: ${testOrderData.producedQuantity} (initial)`);

    // 檢查用戶權限
    console.log(`\n=== User Permissions ===`);
    console.log(`User role: ${user.role}`);
    console.log(`Can create orders: ${user.role === 'manufacturer' ? '✅ YES' : '❌ NO'}`);

    // 檢查模型權限
    const modelOrgId = model.organizationId._id ? model.organizationId._id.toString() : model.organizationId.toString();
    const userOrgId = user.organizationId?.toString();
    console.log(`Model organization: ${modelOrgId}`);
    console.log(`User organization: ${userOrgId}`);
    console.log(`Can access model: ${modelOrgId === userOrgId ? '✅ YES' : '❌ NO'}`);

    console.log('\n=== API Endpoints ===');
    console.log('POST /orders - Create order');
    console.log('GET /orders - Get orders list');
    console.log('GET /orders/:id - Get single order');
    console.log('PUT /orders/:id - Update order');
    console.log('DELETE /orders/:id - Delete order');

    console.log('\nTest completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testOrderApi(); 