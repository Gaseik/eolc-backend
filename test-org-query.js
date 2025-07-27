const mongoose = require('mongoose');
require('dotenv').config();

async function testOrgQuery() {
  try {
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eolc');
    console.log('Connected to MongoDB');
    
    // 引入 Organization model
    const Organization = require('./dist/models/Organization').default;
    
    // 查詢特定的組織
    const orgId = '68863f13f15718fc6224fa0d';
    console.log('Querying organization with ID:', orgId);
    
    const org = await Organization.findById(orgId);
    console.log('Organization found:', org ? 'yes' : 'no');
    if (org) {
      console.log('Organization data:', org);
    }
    
    // 查詢所有組織
    const allOrgs = await Organization.find({});
    console.log('Total organizations:', allOrgs.length);
    allOrgs.forEach((org, index) => {
      console.log(`Org ${index + 1}:`, org._id, org.name, org.type);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testOrgQuery(); 