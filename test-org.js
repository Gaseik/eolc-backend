const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');

async function testOrganizationQuery() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 測試查詢所有組織
    const orgs = await mongoose.model('Organization').find({});
    console.log('All organizations:', orgs.length);
    
    if (orgs.length > 0) {
      console.log('First organization:', JSON.stringify(orgs[0], null, 2));
    }

    // 測試查詢特定組織
    if (orgs.length > 0) {
      const org = await mongoose.model('Organization').findById(orgs[0]._id);
      console.log('Found organization by ID:', org ? 'Yes' : 'No');
    }

    console.log('Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testOrganizationQuery(); 