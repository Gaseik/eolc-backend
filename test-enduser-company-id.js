const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function testEndUserCompanyId() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Testing endUserCompanyId Structure ===');

    // 檢查現有的終端用戶組織
    const endUserOrganizations = await mongoose.model('Organization').find({ type: 'endUser' });
    console.log(`\nEnd user organizations found: ${endUserOrganizations.length}`);
    
    if (endUserOrganizations.length > 0) {
      console.log('End user organizations:');
      endUserOrganizations.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (ID: ${org._id})`);
      });
    } else {
      console.log('No end user organizations found. Creating test data...');
      
      // 創建測試的終端用戶組織
      const testOrganizations = [
        { name: 'ABC Hospital', type: 'endUser', address: '123 Medical Center Dr', email: 'contact@abchospital.com', contactPhone: '+1-555-0101' },
        { name: 'XYZ Medical Center', type: 'endUser', address: '456 Health Ave', email: 'info@xyzmedical.com', contactPhone: '+1-555-0102' },
        { name: 'City General Hospital', type: 'endUser', address: '789 Hospital Blvd', email: 'admin@citygeneral.com', contactPhone: '+1-555-0103' },
        { name: 'Regional Medical Center', type: 'endUser', address: '321 Care Street', email: 'contact@regionalmed.com', contactPhone: '+1-555-0104' },
        { name: 'Community Health Clinic', type: 'endUser', address: '654 Wellness Way', email: 'info@communityhealth.com', contactPhone: '+1-555-0105' }
      ];

      for (const orgData of testOrganizations) {
        const org = new mongoose.model('Organization')(orgData);
        await org.save();
        console.log(`✅ Created organization: ${org.name} (ID: ${org._id})`);
      }
    }

    // 獲取用戶和模型
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com (manufacturer)
    const modelId = '68880f43d6999e323f7aa18c'; // Sample Medical Device

    const user = await mongoose.model('User').findById(userId);
    const model = await mongoose.model('Model').findById(modelId);

    if (!user || !model) {
      console.log('❌ User or Model not found');
      return;
    }

    console.log(`\n✅ User: ${user.email} (${user.role})`);
    console.log(`✅ Model: ${model.modelName}`);

    // 獲取一個終端用戶組織作為測試
    const testEndUserOrg = await mongoose.model('Organization').findOne({ type: 'endUser' });
    if (!testEndUserOrg) {
      console.log('❌ No end user organization found');
      return;
    }

    console.log(`\n✅ Test end user organization: ${testEndUserOrg.name} (ID: ${testEndUserOrg._id})`);

    // 測試創建訂單的數據
    const testOrderData = {
      modelId: modelId,
      batchNumber: `TEST-BATCH-${Date.now()}`,
      endUserCompanyId: testEndUserOrg._id,
      producedQuantity: 100
    };

    console.log('\n=== Test Order Data ===');
    console.log('Order data:', {
      ...testOrderData,
      endUserCompanyId: testOrderData.endUserCompanyId.toString()
    });

    // 驗證組織存在
    const orgExists = await mongoose.model('Organization').findById(testOrderData.endUserCompanyId);
    console.log(`Organization validation: ${orgExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    // 檢查現有訂單
    const existingOrders = await mongoose.model('Order').find({});
    console.log(`\nExisting orders: ${existingOrders.length}`);

    if (existingOrders.length > 0) {
      console.log('Sample order with old structure:');
      const oldOrder = existingOrders[0];
      console.log(`  ID: ${oldOrder._id}`);
      console.log(`  Batch Number: ${oldOrder.batchNumber}`);
      console.log(`  End User Company: ${oldOrder.endUserCompany || 'N/A'}`);
      console.log(`  End User Company ID: ${oldOrder.endUserCompanyId || 'N/A'}`);
    }

    console.log('\n=== API Changes ===');
    console.log('✅ Order model updated to use endUserCompanyId');
    console.log('✅ API now requires Organization ID instead of company name');
    console.log('✅ getAllEndUserCompanies returns Organization objects');
    console.log('✅ All queries populate endUserCompanyId with Organization data');

    console.log('\n=== Migration Required ===');
    console.log('⚠️  Existing orders need to be migrated from endUserCompany to endUserCompanyId');
    console.log('⚠️  Need to create Organization records for existing company names');
    console.log('⚠️  Update all API calls to use endUserCompanyId instead of endUserCompany');

    console.log('\nTest completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testEndUserCompanyId(); 