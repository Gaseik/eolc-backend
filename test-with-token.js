const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function testWithToken() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Testing getAllEndUserCompanies with Database ===');

    // 獲取測試用戶
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com (manufacturer)
    const user = await mongoose.model('User').findById(userId);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User: ${user.email} (${user.role})`);

    // 模擬 getAllEndUserCompanies 函數的邏輯
    console.log('\n=== Simulating getAllEndUserCompanies Logic ===');

    // 構建查詢條件
    let query = {};
    
    // 根據用戶角色決定查詢範圍
    if (user.role !== 'admin') {
      // 非管理員只能看到自己創建的訂單中的公司
      query.createdBy = userId;
    }

    console.log('Query:', query);

    // 獲取所有不重複的終端用戶公司 ID
    const companyIds = await mongoose.model('Order').distinct('endUserCompanyId', query);
    console.log('Company IDs found:', companyIds);

    // 如果沒有找到任何公司 ID，返回空數組
    if (!companyIds || companyIds.length === 0) {
      console.log('✅ No company IDs found, returning empty array');
      return;
    }

    // 獲取公司詳細信息
    const companies = await mongoose.model('Organization').find({ 
      _id: { $in: companyIds },
      type: 'endUser' // 只獲取終端用戶類型的組織
    }).select('name type address email contactPhone');

    console.log('Companies found:', companies.length);
    companies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (${company.type})`);
    });

    // 按名稱排序
    const sortedCompanies = companies.sort((a, b) => a.name.localeCompare(b.name));

    console.log('\n=== Expected API Response ===');
    console.log(JSON.stringify({
      success: true,
      data: sortedCompanies,
      count: sortedCompanies.length
    }, null, 2));

    console.log('\n✅ Database test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testWithToken(); 