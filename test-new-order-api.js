const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function testNewOrderApi() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Testing New Order API with endUserCompanyId ===');

    // 獲取測試數據
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

    // 獲取終端用戶組織
    const endUserOrgs = await mongoose.model('Organization').find({ type: 'endUser' });
    console.log(`\nEnd user organizations: ${endUserOrgs.length}`);
    
    if (endUserOrgs.length === 0) {
      console.log('❌ No end user organizations found');
      return;
    }

    endUserOrgs.forEach((org, index) => {
      console.log(`  ${index + 1}. ${org.name} (ID: ${org._id})`);
    });

    // 測試創建新訂單
    const testEndUserOrg = endUserOrgs[0];
    console.log(`\n✅ Using end user organization: ${testEndUserOrg.name} (ID: ${testEndUserOrg._id})`);

    const newOrderData = {
      modelId: modelId,
      batchNumber: `NEW-BATCH-${Date.now()}`,
      endUserCompanyId: testEndUserOrg._id,
      producedQuantity: 200
    };

    console.log('\n=== Creating New Order ===');
    console.log('Order data:', {
      ...newOrderData,
      endUserCompanyId: newOrderData.endUserCompanyId.toString()
    });

    // 創建新訂單
    const newOrder = new mongoose.model('Order')({
      ...newOrderData,
      inUseQuantity: 0,
      disposedQuantity: 0,
      unusedQuantity: 200,
      createdBy: userId,
      status: 'pending'
    });

    await newOrder.save();
    console.log(`✅ Created new order: ${newOrder.batchNumber}`);

    // 驗證創建的訂單
    const populatedOrder = await mongoose.model('Order').findById(newOrder._id)
      .populate('modelId', 'modelName modelNumber')
      .populate('endUserCompanyId', 'name type address email contactPhone')
      .populate('createdBy', 'firstName lastName email');

    console.log('\n=== Order Details ===');
    console.log(`ID: ${populatedOrder._id}`);
    console.log(`Batch Number: ${populatedOrder.batchNumber}`);
    console.log(`Model: ${populatedOrder.modelId.modelName}`);
    console.log(`End User Company: ${populatedOrder.endUserCompanyId.name} (${populatedOrder.endUserCompanyId.type})`);
    console.log(`Company Address: ${populatedOrder.endUserCompanyId.address}`);
    console.log(`Company Email: ${populatedOrder.endUserCompanyId.email}`);
    console.log(`Company Phone: ${populatedOrder.endUserCompanyId.contactPhone}`);
    console.log(`Produced Quantity: ${populatedOrder.producedQuantity}`);
    console.log(`Status: ${populatedOrder.status}`);
    console.log(`Created By: ${populatedOrder.createdBy.firstName} ${populatedOrder.createdBy.lastName}`);

    // 測試獲取所有終端用戶公司
    console.log('\n=== Testing getAllEndUserCompanies ===');
    
    // 獲取該用戶創建的訂單中的公司 ID
    const userCompanyIds = await mongoose.model('Order').distinct('endUserCompanyId', {
      createdBy: userId
    });

    console.log(`Companies accessible by user: ${userCompanyIds.length}`);
    
    // 獲取公司詳細信息
    const userCompanies = await mongoose.model('Organization').find({
      _id: { $in: userCompanyIds },
      type: 'endUser'
    }).select('name type address email contactPhone');

    console.log('Companies:');
    userCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name}`);
      console.log(`     Type: ${company.type}`);
      console.log(`     Address: ${company.address}`);
      console.log(`     Email: ${company.email}`);
      console.log(`     Phone: ${company.contactPhone}`);
    });

    console.log('\n=== API Endpoints ===');
    console.log('POST /orders - Create order (requires endUserCompanyId)');
    console.log('GET /orders - Get orders list (populates endUserCompanyId)');
    console.log('GET /orders/:id - Get single order (populates endUserCompanyId)');
    console.log('PUT /orders/:id - Update order');
    console.log('DELETE /orders/:id - Delete order');
    console.log('GET /orders/companies - Get all end user companies (returns Organization objects)');

    console.log('\n✅ New Order API test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNewOrderApi(); 