const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');

// 模擬 getModelById 函數的邏輯
async function simulateGetModelById(userId, modelId) {
  try {
    console.log('Simulating getModelById function...');
    console.log(`User ID: ${userId}`);
    console.log(`Model ID: ${modelId}`);

    // 查找用戶
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return { success: false, error: 'User not found', status: 404 };
    }

    console.log(`✅ User found: ${user.email}`);

    // 查找模型
    const model = await mongoose.model('Model').findById(modelId);
    if (!model) {
      console.log('❌ Model not found');
      return { success: false, error: 'Model not found', status: 404 };
    }

    console.log(`✅ Model found: ${model.modelName}`);

    // 檢查權限
    const userOrgId = user.organizationId?.toString();
    const modelOrgId = model.organizationId?.toString();
    
    console.log(`User organizationId: ${userOrgId}`);
    console.log(`Model organizationId: ${modelOrgId}`);
    console.log(`Are they equal? ${userOrgId === modelOrgId}`);

    if (userOrgId !== modelOrgId) {
      console.log('❌ Access denied - organization mismatch');
      return { success: false, error: 'Access denied', status: 403 };
    }

    console.log('✅ Access granted');
    return { 
      success: true, 
      data: model,
      status: 200 
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: 'Server error', status: 500 };
  }
}

async function testApiCall() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 測試參數
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com
    const modelId = '68880f43d6999e323f7aa18c'; // 從請求中的模型ID

    console.log('=== Testing API Call ===');
    const result = await simulateGetModelById(userId, modelId);
    
    console.log('\n=== Result ===');
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.success}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    if (result.data) {
      console.log(`Model Name: ${result.data.modelName}`);
    }

    console.log('\nTest completed');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testApiCall(); 