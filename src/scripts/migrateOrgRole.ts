import mongoose from 'mongoose';
import User from '../models/User';

// 數據遷移腳本：為舊用戶設置 orgRole
async function migrateOrgRole() {
  try {
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    // 查找沒有 orgRole 的用戶
    const usersWithoutOrgRole = await User.find({ orgRole: { $exists: false } });
    console.log(`Found ${usersWithoutOrgRole.length} users without orgRole`);

    if (usersWithoutOrgRole.length > 0) {
      // 為這些用戶設置預設的 orgRole
      const updatePromises = usersWithoutOrgRole.map(user => {
        let defaultOrgRole = 'member';
        
        // 如果用戶是組織的創建者（orgRole 為 admin），或者沒有 organizationId（平台 admin）
        if (!user.organizationId) {
          defaultOrgRole = 'member'; // 平台 admin 沒有組織
        } else {
          // 檢查是否為組織的第一個成員（創建者）
          defaultOrgRole = 'member'; // 預設為 member，可以手動調整
        }
        
        return User.findByIdAndUpdate(user._id, { 
          $set: { orgRole: defaultOrgRole } 
        });
      });

      await Promise.all(updatePromises);
      console.log('Successfully updated orgRole for all users');
    }

    // 檢查所有用戶的 orgRole 狀態
    const totalUsers = await User.countDocuments();
    const usersWithOrgRole = await User.countDocuments({ orgRole: { $exists: true } });
    
    console.log(`Migration completed:`);
    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Users with orgRole: ${usersWithOrgRole}`);
    console.log(`- Users without orgRole: ${totalUsers - usersWithOrgRole}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  migrateOrgRole();
}

export default migrateOrgRole; 