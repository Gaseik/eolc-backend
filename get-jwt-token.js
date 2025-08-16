const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');

async function getJwtToken() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Getting JWT Token ===');

    // 獲取測試用戶
    const userId = '688649a0737d08661d374722'; // gaseik@gmail.com (manufacturer)
    const user = await mongoose.model('User').findById(userId);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User: ${user.email} (${user.role})`);

    // 生成 JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('\n=== JWT Token ===');
    console.log('Token:', token);
    
    console.log('\n=== Test Commands ===');
    console.log('1. Test with curl:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:8080/organizations/end-users`);
    
    console.log('\n2. Test with browser:');
    console.log('Set cookie: token=' + token);
    console.log('Then visit: http://localhost:8080/organizations/end-users');
    
    console.log('\n3. Test with Postman:');
    console.log('Add header: Authorization: Bearer ' + token);
    console.log('GET: http://localhost:8080/organizations/end-users');

    console.log('\n✅ JWT token generated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to get JWT token:', error);
    process.exit(1);
  }
}

getJwtToken(); 