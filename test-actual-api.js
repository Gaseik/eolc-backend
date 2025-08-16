const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');

// 模擬修復後的 getModelById 函數
async function testNewResponseStructure(userId, modelId) {
  try {
    console.log('=== Testing New Response Structure ===');
    console.log(`User ID: ${userId}`);
    console.log(`Model ID: ${modelId}`);

    // 檢查用戶是否存在
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return { success: false, error: 'User not found', status: 404 };
    }

    console.log(`✅ User found: ${user.email}`);

    // 查找模型
    const model = await mongoose.model('Model').findById(modelId)
      .populate('createdBy', 'firstName lastName email')
      .populate('approvers.id', 'firstName lastName email')
      .populate('organizationId', 'name type address taxId email contactPhone website');

    if (!model) {
      console.log('❌ Model not found');
      return { success: false, error: 'Model not found', status: 404 };
    }

    console.log(`✅ Model found: ${model.modelName}`);

    // 權限檢查
    const modelOrgId = model.organizationId._id ? model.organizationId._id.toString() : model.organizationId.toString();
    const userOrgId = user.organizationId?.toString();
    
    if (modelOrgId !== userOrgId) {
      console.log('❌ Access denied - organization mismatch');
      return { success: false, error: 'Access denied', status: 403 };
    }

    console.log('✅ Access granted');

    // 重構響應數據，將 organizationId 重命名為 organization
    const responseData = model.toObject();
    responseData.organization = responseData.organizationId;
    delete responseData.organizationId;

    console.log('\n=== Response Structure ===');
    console.log('Original organizationId:', model.organizationId);
    console.log('New organization field:', responseData.organization);
    console.log('Has organizationId field:', 'organizationId' in responseData);
    console.log('Has organization field:', 'organization' in responseData);

    return { 
      success: true, 
      data: responseData,
      status: 200 
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: 'Server error', status: 500 };
  }
}

async function testNewStructure() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 測試參數
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com
    const modelId = '68880f43d6999e323f7aa18c'; // 從請求中的模型ID

    const result = await testNewResponseStructure(userId, modelId);
    
    console.log('\n=== Final Result ===');
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.success}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    if (result.data) {
      console.log(`Model Name: ${result.data.modelName}`);
      console.log(`Organization Name: ${result.data.organization?.name || 'N/A'}`);
      console.log(`Organization Type: ${result.data.organization?.type || 'N/A'}`);
    }

    console.log('\nTest completed');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testNewStructure(); 