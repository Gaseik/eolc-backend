const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');

async function testUserQuery() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 測試查詢所有用戶
    const users = await mongoose.model('User').find({});
    console.log('All users:', users.length);
    
    if (users.length > 0) {
      console.log('First user:', JSON.stringify(users[0], null, 2));
      
      // 檢查用戶的組織ID
      console.log('User organizationId:', users[0].organizationId);
      console.log('User role:', users[0].role);
    }

    console.log('Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testUserQuery(); 