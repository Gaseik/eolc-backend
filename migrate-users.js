const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');

async function migrateUsersToOrganizations() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 找出沒有組織的用戶（排除 admin）
    const usersWithoutOrg = await mongoose.model('User').find({
      organizationId: { $exists: false },
      role: { $ne: 'admin' }
    });

    console.log(`Found ${usersWithoutOrg.length} users without organization`);

    for (const user of usersWithoutOrg) {
      try {
        // 為每個用戶創建組織
        const org = await mongoose.model('Organization').create({
          name: `${user.firstName} ${user.lastName}'s Organization`,
          type: user.role,
          members: [user._id],
          status: 'active',
          invitations: []
        });

        // 更新用戶，綁定到新組織
        await mongoose.model('User').findByIdAndUpdate(user._id, {
          organizationId: org._id,
          orgRole: 'admin'
        });

        console.log(`Created organization for user ${user.email}: ${org.name}`);
      } catch (error) {
        console.error(`Error creating organization for user ${user.email}:`, error);
      }
    }

    // 處理 organizationId 為 null 的用戶（排除 admin）
    const usersWithNullOrg = await mongoose.model('User').find({
      organizationId: null,
      role: { $ne: 'admin' }
    });

    console.log(`Found ${usersWithNullOrg.length} users with null organizationId`);

    for (const user of usersWithNullOrg) {
      try {
        // 為每個用戶創建組織
        const org = await mongoose.model('Organization').create({
          name: `${user.firstName} ${user.lastName}'s Organization`,
          type: user.role,
          members: [user._id],
          status: 'active',
          invitations: []
        });

        // 更新用戶，綁定到新組織
        await mongoose.model('User').findByIdAndUpdate(user._id, {
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