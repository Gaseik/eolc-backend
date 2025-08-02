const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/Organization.js');

async function testSimpleApi() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Testing Simple getAllEndUserCompanies ===');

    // 直接獲取所有 type 為 endUser 的組織
    const companies = await mongoose.model('Organization').find({ type: 'endUser' })
      .select('name type address email contactPhone')
      .sort({ name: 1 });

    console.log(`Found ${companies.length} end user companies:`);
    companies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (${company.type})`);
      console.log(`     Address: ${company.address}`);
      console.log(`     Email: ${company.email}`);
      console.log(`     Phone: ${company.contactPhone}`);
    });

    console.log('\n=== Expected API Response ===');
    console.log(JSON.stringify({
      success: true,
      data: companies,
      count: companies.length
    }, null, 2));

    console.log('\n✅ Simple API test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testSimpleApi(); 