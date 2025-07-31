const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');

async function testUserQuery() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 查找特定用戶
    const specificUser = await mongoose.model('User').findOne({ email: 'gaseik@gmail.com' });
    
    if (specificUser) {
      console.log('Specific user found:');
      console.log(`  ID: ${specificUser._id}`);
      console.log(`  Email: ${specificUser.email}`);
      console.log(`  Role: ${specificUser.role}`);
      console.log(`  OrganizationId: ${specificUser.organizationId}`);
      console.log(`  Name: ${specificUser.firstName} ${specificUser.lastName}`);
      console.log(`  OrganizationId type: ${typeof specificUser.organizationId}`);
      console.log(`  OrganizationId toString: ${specificUser.organizationId?.toString()}`);
    } else {
      console.log('User gaseik@gmail.com not found');
    }

    // 測試查詢所有用戶
    const users = await mongoose.model('User').find({});
    console.log('\nAll users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  OrganizationId: ${user.organizationId}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log('---');
    });

    console.log('Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testUserQuery(); 