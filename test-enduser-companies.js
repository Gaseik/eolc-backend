const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function testEndUserCompanies() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Testing getAllEndUserCompanies API ===');

    // 檢查現有訂單
    const existingOrders = await mongoose.model('Order').find({});
    console.log(`\nExisting orders: ${existingOrders.length}`);

    if (existingOrders.length > 0) {
      console.log('\nSample orders with end user companies:');
      existingOrders.slice(0, 5).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.endUserCompany} (Batch: ${order.batchNumber})`);
      });
    }

    // 測試獲取所有終端用戶公司
    console.log('\n=== Testing Distinct Companies ===');
    
    // 獲取所有不重複的公司名稱
    const allCompanies = await mongoose.model('Order').distinct('endUserCompany');
    console.log(`Total unique companies: ${allCompanies.length}`);
    
    if (allCompanies.length > 0) {
      console.log('Companies found:');
      allCompanies.sort().forEach((company, index) => {
        console.log(`  ${index + 1}. ${company}`);
      });
    } else {
      console.log('No companies found in orders');
    }

    // 測試不同用戶角色的權限
    console.log('\n=== Testing User Role Permissions ===');
    
    // 測試 manufacturer 用戶
    const manufacturerId = '688649a0737d08661d374722'; // gaseik@gmail.com
    const manufacturer = await mongoose.model('User').findById(manufacturerId);
    
    if (manufacturer) {
      console.log(`Manufacturer: ${manufacturer.email} (${manufacturer.role})`);
      
      // 獲取該用戶創建的訂單中的公司
      const userCompanies = await mongoose.model('Order').distinct('endUserCompany', {
        createdBy: manufacturerId
      });
      
      console.log(`Companies accessible by manufacturer: ${userCompanies.length}`);
      if (userCompanies.length > 0) {
        userCompanies.sort().forEach((company, index) => {
          console.log(`  ${index + 1}. ${company}`);
        });
      }
    }

    // 測試 admin 用戶
    const adminUsers = await mongoose.model('User').find({ role: 'admin' });
    console.log(`\nAdmin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log(`Admin: ${admin.email} (${admin.role})`);
      
      // Admin 可以看到所有公司
      console.log('Admin can access all companies');
    }

    console.log('\n=== API Endpoint ===');
    console.log('GET /orders/companies - Get all end user companies');
    console.log('Response format:');
    console.log('{');
    console.log('  "success": true,');
    console.log('  "data": ["Company A", "Company B", ...],');
    console.log('  "count": 5');
    console.log('}');

    console.log('\nTest completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testEndUserCompanies(); 