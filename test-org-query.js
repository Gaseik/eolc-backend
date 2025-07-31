const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');

async function testPermissionCheck() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 測試的用戶和模型ID
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com
    const modelId = '68880f43d6999e323f7aa18c'; // 從請求中的模型ID

    console.log('Testing permission check:');
    console.log(`User ID: ${userId}`);
    console.log(`Model ID: ${modelId}`);

    // 查找用戶
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('\nUser details:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  OrganizationId: ${user.organizationId}`);
    console.log(`  OrganizationId type: ${typeof user.organizationId}`);
    console.log(`  OrganizationId toString: ${user.organizationId?.toString()}`);

    // 查找模型
    const model = await mongoose.model('Model').findById(modelId);
    if (!model) {
      console.log('Model not found');
      return;
    }

    console.log('\nModel details:');
    console.log(`  ID: ${model._id}`);
    console.log(`  Name: ${model.modelName}`);
    console.log(`  OrganizationId: ${model.organizationId}`);
    console.log(`  OrganizationId type: ${typeof model.organizationId}`);
    console.log(`  OrganizationId toString: ${model.organizationId?.toString()}`);

    // 執行權限檢查
    console.log('\nPermission check:');
    const userOrgId = user.organizationId?.toString();
    const modelOrgId = model.organizationId?.toString();
    
    console.log(`User organizationId: ${userOrgId}`);
    console.log(`Model organizationId: ${modelOrgId}`);
    console.log(`Are they equal? ${userOrgId === modelOrgId}`);
    
    if (userOrgId === modelOrgId) {
      console.log('✅ Permission check PASSED - User should have access');
    } else {
      console.log('❌ Permission check FAILED - User should NOT have access');
    }

    console.log('\nTest completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testPermissionCheck(); 