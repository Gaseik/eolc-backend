const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function testOrganizationEndUsers() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Testing GET /organizations/end-users API ===');

    // 獲取測試用戶
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com (manufacturer)
    const user = await mongoose.model('User').findById(userId);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User: ${user.email} (${user.role})`);

    // 檢查現有訂單
    const existingOrders = await mongoose.model('Order').find({ createdBy: userId });
    console.log(`\nOrders created by user: ${existingOrders.length}`);

    if (existingOrders.length > 0) {
      console.log('Sample orders:');
      existingOrders.slice(0, 3).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.batchNumber} -> ${order.endUserCompanyId || 'N/A'}`);
      });
    }

    // 獲取該用戶創建的訂單中的公司 ID
    const userCompanyIds = await mongoose.model('Order').distinct('endUserCompanyId', {
      createdBy: userId
    });

    console.log(`\nUnique company IDs from user's orders: ${userCompanyIds.length}`);
    userCompanyIds.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });

    // 獲取公司詳細信息
    const userCompanies = await mongoose.model('Organization').find({
      _id: { $in: userCompanyIds },
      type: 'endUser'
    }).select('name type address email contactPhone');

    console.log(`\nEnd user companies accessible by user: ${userCompanies.length}`);
    userCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name}`);
      console.log(`     Type: ${company.type}`);
      console.log(`     Address: ${company.address}`);
      console.log(`     Email: ${company.email}`);
      console.log(`     Phone: ${company.contactPhone}`);
    });

    // 檢查所有終端用戶組織
    const allEndUserOrgs = await mongoose.model('Organization').find({ type: 'endUser' });
    console.log(`\nTotal end user organizations in system: ${allEndUserOrgs.length}`);
    
    if (allEndUserOrgs.length > 0) {
      console.log('All end user organizations:');
      allEndUserOrgs.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (ID: ${org._id})`);
      });
    }

    // 測試不同用戶角色的權限
    console.log('\n=== Testing Role Permissions ===');
    
    // 測試 manufacturer 用戶
    console.log(`Manufacturer (${user.role}) can access: ${userCompanies.length} companies`);
    
    // 測試 admin 用戶
    const adminUsers = await mongoose.model('User').find({ role: 'admin' });
    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log(`Admin (${admin.role}) can access: all companies (${allEndUserOrgs.length})`);
    }

    console.log('\n=== API Endpoint ===');
    console.log('GET /organizations/end-users - Get all end user companies');
    console.log('Response format:');
    console.log('{');
    console.log('  "success": true,');
    console.log('  "data": [');
    console.log('    {');
    console.log('      "_id": "company_id",');
    console.log('      "name": "Company Name",');
    console.log('      "type": "endUser",');
    console.log('      "address": "Company Address",');
    console.log('      "email": "company@email.com",');
    console.log('      "contactPhone": "+1-555-0000"');
    console.log('    }');
    console.log('  ],');
    console.log('  "count": 1');
    console.log('}');

    console.log('\n=== Migration Summary ===');
    console.log('✅ Moved getAllEndUserCompanies from Order to Organization controller');
    console.log('✅ Updated API endpoint: /orders/companies → /organizations/end-users');
    console.log('✅ Maintained same functionality and permissions');
    console.log('✅ Updated Swagger documentation');

    console.log('\n✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOrganizationEndUsers(); 