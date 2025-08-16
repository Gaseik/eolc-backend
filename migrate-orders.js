const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development' });

// 載入模型
require('./dist/models/User.js');
require('./dist/models/Organization.js');
require('./dist/models/Model.js');
require('./dist/models/Order.js');

async function migrateOrders() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');

    console.log('=== Migrating Orders from endUserCompany to endUserCompanyId ===');

    // 獲取所有現有訂單
    const existingOrders = await mongoose.model('Order').find({});
    console.log(`\nFound ${existingOrders.length} existing orders`);

    if (existingOrders.length === 0) {
      console.log('No orders to migrate');
      return;
    }

    // 分析現有的公司名稱
    const companyNames = [...new Set(existingOrders.map(order => order.endUserCompany).filter(Boolean))];
    console.log(`\nUnique company names found: ${companyNames.length}`);
    companyNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

    // 為每個公司名稱創建或獲取 Organization 記錄
    const companyMap = new Map();
    
    for (const companyName of companyNames) {
      // 檢查是否已存在相同名稱的終端用戶組織
      let organization = await mongoose.model('Organization').findOne({ 
        name: companyName, 
        type: 'endUser' 
      });

      if (!organization) {
        // 創建新的終端用戶組織
        const orgData = {
          name: companyName,
          type: 'endUser',
          address: `${companyName} Address`,
          email: `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          contactPhone: '+1-555-0000'
        };

        organization = new mongoose.model('Organization')(orgData);
        await organization.save();
        console.log(`✅ Created organization: ${organization.name} (ID: ${organization._id})`);
      } else {
        console.log(`✅ Found existing organization: ${organization.name} (ID: ${organization._id})`);
      }

      companyMap.set(companyName, organization._id);
    }

    // 更新所有訂單
    console.log('\n=== Updating Orders ===');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const order of existingOrders) {
      if (order.endUserCompany && companyMap.has(order.endUserCompany)) {
        // 更新訂單
        await mongoose.model('Order').findByIdAndUpdate(order._id, {
          endUserCompanyId: companyMap.get(order.endUserCompany)
        });
        
        console.log(`✅ Updated order: ${order.batchNumber} -> ${order.endUserCompany} (ID: ${companyMap.get(order.endUserCompany)})`);
        updatedCount++;
      } else {
        console.log(`⚠️  Skipped order: ${order.batchNumber} (no endUserCompany or mapping)`);
        skippedCount++;
      }
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`✅ Updated orders: ${updatedCount}`);
    console.log(`⚠️  Skipped orders: ${skippedCount}`);
    console.log(`📊 Total orders processed: ${existingOrders.length}`);

    // 驗證遷移結果
    console.log('\n=== Verification ===');
    const updatedOrders = await mongoose.model('Order').find({}).populate('endUserCompanyId', 'name type');
    
    console.log(`Orders with endUserCompanyId: ${updatedOrders.filter(o => o.endUserCompanyId).length}`);
    
    if (updatedOrders.length > 0) {
      console.log('Sample updated orders:');
      updatedOrders.slice(0, 3).forEach((order, index) => {
        const companyName = order.endUserCompanyId ? order.endUserCompanyId.name : 'N/A';
        console.log(`  ${index + 1}. ${order.batchNumber} -> ${companyName}`);
      });
    }

    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateOrders(); 