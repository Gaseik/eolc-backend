import mongoose from 'mongoose';
import User from '../models/User';
import Organization from '../models/Organization';
import dotenv from 'dotenv';

async function migrateUsersToOrganizations() {
  try {
    // 載入環境變數
    dotenv.config({ path: '.env.development' });
    
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 找出沒有組織的用戶（排除 admin）
    const usersWithoutOrg = await User.find({
      organizationId: { $exists: false },
      role: { $ne: 'admin' }
    });

    console.log(`Found ${usersWithoutOrg.length} users without organization`);

    for (const user of usersWithoutOrg) {
      try {
        // 為每個用戶創建組織
        const org = await Organization.create({
          name: `${user.firstName} ${user.lastName}'s Organization`,
          type: user.role as 'manufacturer' | 'regulator' | 'endUser',
          members: [user._id],
          status: 'active',
          invitations: []
        });

        // 更新用戶，綁定到新組織
        await User.findByIdAndUpdate(user._id, {
          organizationId: org._id,
          orgRole: 'admin'
        });

        console.log(`Created organization for user ${user.email}: ${org.name}`);
      } catch (error) {
        console.error(`Error creating organization for user ${user.email}:`, error);
      }
    }

    // 處理 organizationId 為 null 的用戶（排除 admin）
    const usersWithNullOrg = await User.find({
      organizationId: null,
      role: { $ne: 'admin' }
    });

    console.log(`Found ${usersWithNullOrg.length} users with null organizationId`);

    for (const user of usersWithNullOrg) {
      try {
        // 為每個用戶創建組織
        const org = await Organization.create({
          name: `${user.firstName} ${user.lastName}'s Organization`,
          type: user.role as 'manufacturer' | 'regulator' | 'endUser',
          members: [user._id],
          status: 'active',
          invitations: []
        });

        // 更新用戶，綁定到新組織
        await User.findByIdAndUpdate(user._id, {
          organizationId: org._id,
          orgRole: 'admin'
        });

        console.log(`Created organization for user ${user.email}: ${org.name}`);
      } catch (error) {
        console.error(`Error creating organization for user ${user.email}:`, error);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// 執行遷移
migrateUsersToOrganizations(); 