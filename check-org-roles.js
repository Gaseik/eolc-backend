const mongoose = require('mongoose');
require('dotenv').config();

async function checkOrgRoles() {
  try {
    console.log('🔍 檢查所有用戶的組織角色...\n');
    
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    console.log('📡 數據庫連接狀態:', mongoose.connection.readyState);
    console.log('🔗 數據庫 URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/eolc');
    
    // 檢查所有集合
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 數據庫集合:', collections.map(c => c.name));
    
    // 定義用戶模型（使用與主應用相同的 schema）
    const UserSchema = new mongoose.Schema({
      email: String,
      role: String,
      organizationId: mongoose.Schema.Types.ObjectId,
      orgRole: String,
      firstName: String,
      lastName: String
    });

    const User = mongoose.model('User', UserSchema);
    
    const users = await User.find({}, 'email role organizationId orgRole firstName lastName');
    console.log('👥 找到用戶數量:', users.length);
    
    if (users.length === 0) {
      // 嘗試查找任何用戶文檔
      const anyUser = await mongoose.connection.db.collection('users').findOne({});
      console.log('🔍 直接查詢用戶集合:', anyUser ? '找到用戶' : '沒有用戶');
      if (anyUser) {
        console.log('📄 用戶文檔示例:', JSON.stringify(anyUser, null, 2));
      }
    }
    
    console.log('📊 用戶組織角色統計：');
    console.log('='.repeat(60));
    
    const roleStats = {};
    
    users.forEach(user => {
      const roleKey = `${user.role} (${user.orgRole || 'N/A'})`;
      if (!roleStats[roleKey]) {
        roleStats[roleKey] = [];
      }
      roleStats[roleKey].push(user);
    });
    
    Object.keys(roleStats).forEach(roleKey => {
      console.log(`\n👥 ${roleKey}: ${roleStats[roleKey].length} 人`);
      roleStats[roleKey].forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 總計: ${users.length} 個用戶`);
    
    // 統計組織角色分布
    const orgRoleStats = {};
    users.forEach(user => {
      const orgRole = user.orgRole || 'N/A';
      orgRoleStats[orgRole] = (orgRoleStats[orgRole] || 0) + 1;
    });
    
    console.log('\n🏢 組織角色分布：');
    Object.keys(orgRoleStats).forEach(orgRole => {
      console.log(`   - ${orgRole}: ${orgRoleStats[orgRole]} 人`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ 檢查完成！');
  } catch (error) {
    console.error('❌ 錯誤:', error);
    process.exit(1);
  }
}

checkOrgRoles(); 