import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';
import Organization from '../src/models/Organization';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eolc';

async function createEndUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'enduser@test.com';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    // 檢查用戶是否已存在
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('EndUser already exists');
      process.exit(0);
    }

    // 創建 endUser 組織
    const organization = await Organization.create({
      name: 'Test EndUser Organization',
      type: 'endUser',
      address: '123 Test Street',
      email: 'contact@testenduser.com',
      contactPhone: '+1-555-0000',
      status: 'active'
    });

    // 創建 endUser 帳號
    const endUser = await User.create({
      email,
      passwordHash,
      firstName: 'Test',
      lastName: 'EndUser',
      role: 'endUser',
      organizationId: organization._id,
      emailVerified: true,
      orgRole: 'admin'
    });

    console.log('EndUser created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Organization: ${organization.name}`);
    console.log(`User ID: ${endUser._id}`);
    console.log(`Organization ID: ${organization._id}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating endUser:', error);
    process.exit(1);
  }
}

createEndUser(); 