const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function createTestOrders() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 獲取現有數據
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com (manufacturer)
    const modelId = '68880f43d6999e323f7aa18c'; // Sample Medical Device

    const user = await mongoose.model('User').findById(userId);
    const model = await mongoose.model('Model').findById(modelId);

    if (!user || !model) {
      console.log('❌ User or Model not found');
      return;
    }

    console.log(`✅ User: ${user.email} (${user.role})`);
    console.log(`✅ Model: ${model.modelName}`);

    // 測試公司數據
    const testCompanies = [
      'ABC Hospital',
      'XYZ Medical Center',
      'City General Hospital',
      'Regional Medical Center',
      'Community Health Clinic',
      'ABC Hospital', // 重複的公司名稱
      'Specialty Medical Group',
      'University Medical Center'
    ];

    console.log('\n=== Creating Test Orders ===');

    // 創建測試訂單
    for (let i = 0; i < testCompanies.length; i++) {
      const orderData = {
        modelId: modelId,
        batchNumber: `TEST-BATCH-${Date.now()}-${i}`,
        endUserCompany: testCompanies[i],
        producedQuantity: 100 + (i * 50),
        inUseQuantity: 0,
        disposedQuantity: 0,
        unusedQuantity: 100 + (i * 50),
        createdBy: userId,
        status: 'pending'
      };

      const order = new mongoose.model('Order')(orderData);
      await order.save();
      
      console.log(`✅ Created order: ${orderData.endUserCompany} (${orderData.batchNumber})`);
    }

    // 驗證創建的訂單
    const createdOrders = await mongoose.model('Order').find({ createdBy: userId });
    console.log(`\nTotal orders created: ${createdOrders.length}`);

    // 獲取所有不重複的公司
    const uniqueCompanies = await mongoose.model('Order').distinct('endUserCompany');
    console.log(`\nUnique companies: ${uniqueCompanies.length}`);
    console.log('Companies:');
    uniqueCompanies.sort().forEach((company, index) => {
      console.log(`  ${index + 1}. ${company}`);
    });

    console.log('\n✅ Test orders created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create test orders:', error);
    process.exit(1);
  }
}

createTestOrders(); 