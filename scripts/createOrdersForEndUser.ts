import mongoose from 'mongoose';
import User from '../src/models/User';
import Model from '../src/models/Model';
import Order from '../src/models/Order';
import Organization from '../src/models/Organization';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eolc';

async function createOrdersForEndUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 獲取 endUser
    console.log('Looking for endUser...');
    const endUser = await User.findOne({ email: 'enduser@test.com' });
    if (!endUser) {
      console.log('❌ EndUser not found');
      return;
    }

    console.log(`✅ Found endUser: ${endUser.email} (${endUser.role})`);
    console.log(`EndUser organizationId: ${endUser.organizationId}`);

    // 獲取一個 manufacturer 用戶
    console.log('Looking for manufacturer...');
    const manufacturer = await User.findOne({ role: 'manufacturer' });
    if (!manufacturer) {
      console.log('❌ No manufacturer found');
      return;
    }

    console.log(`✅ Found manufacturer: ${manufacturer.email}`);

    // 獲取 manufacturer 的模型
    console.log('Looking for models...');
    const models = await Model.find({ organizationId: manufacturer.organizationId });
    if (models.length === 0) {
      console.log('❌ No models found for manufacturer');
      return;
    }

    console.log(`✅ Found ${models.length} models for manufacturer`);

    // 創建測試訂單
    const testOrders = [
      {
        modelId: models[0]._id,
        batchNumber: `ENDUSER-BATCH-001-${Date.now()}`,
        endUserCompanyId: endUser.organizationId,
        producedQuantity: 150,
        inUseQuantity: 50,
        disposedQuantity: 20,
        unusedQuantity: 80,
        status: 'pending'
      },
      {
        modelId: models[0]._id,
        batchNumber: `ENDUSER-BATCH-002-${Date.now()}`,
        endUserCompanyId: endUser.organizationId,
        producedQuantity: 200,
        inUseQuantity: 100,
        disposedQuantity: 30,
        unusedQuantity: 70,
        status: 'production'
      },
      {
        modelId: models[0]._id,
        batchNumber: `ENDUSER-BATCH-003-${Date.now()}`,
        endUserCompanyId: endUser.organizationId,
        producedQuantity: 100,
        inUseQuantity: 80,
        disposedQuantity: 10,
        unusedQuantity: 10,
        status: 'in-used'
      },
      {
        modelId: models[0]._id,
        batchNumber: `ENDUSER-BATCH-004-${Date.now()}`,
        endUserCompanyId: endUser.organizationId,
        producedQuantity: 300,
        inUseQuantity: 200,
        disposedQuantity: 50,
        unusedQuantity: 50,
        status: 'pending'
      },
      {
        modelId: models[0]._id,
        batchNumber: `ENDUSER-BATCH-005-${Date.now()}`,
        endUserCompanyId: endUser.organizationId,
        producedQuantity: 80,
        inUseQuantity: 60,
        disposedQuantity: 15,
        unusedQuantity: 5,
        status: 'disposed'
      }
    ];

    console.log('\n=== Creating Orders for EndUser ===');

    for (const orderData of testOrders) {
      try {
        const order = new Order({
          ...orderData,
          createdBy: manufacturer._id
        });

        await order.save();
        console.log(`✅ Created order: ${orderData.batchNumber} (${orderData.status})`);
        console.log(`   Produced: ${orderData.producedQuantity}, In Use: ${orderData.inUseQuantity}, Disposed: ${orderData.disposedQuantity}, Unused: ${orderData.unusedQuantity}`);
      } catch (error) {
        console.error(`❌ Error creating order ${orderData.batchNumber}:`, error);
      }
    }

    // 驗證創建的訂單
    const createdOrders = await Order.find({ endUserCompanyId: endUser.organizationId });
    console.log(`\n✅ Total orders created for endUser: ${createdOrders.length}`);

    // 顯示訂單摘要
    console.log('\n=== Order Summary ===');
    createdOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.batchNumber} - ${order.status}`);
      console.log(`   Produced: ${order.producedQuantity}, In Use: ${order.inUseQuantity}, Disposed: ${order.disposedQuantity}, Unused: ${order.unusedQuantity}`);
    });

    console.log('\n✅ Orders created successfully for endUser!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating orders:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createOrdersForEndUser(); 