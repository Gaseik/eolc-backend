import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';

dotenv.config();

async function run(): Promise<void> {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || '';
  if (!mongoUri) {
    console.error('MONGO_URI/MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // 找出所有 pending 但數量不合法的訂單：
  // - inUseQuantity > 0
  // - disposedQuantity > 0
  // - unusedQuantity != producedQuantity
  const invalidPending = await Order.find({
    status: 'pending',
    $or: [
      { inUseQuantity: { $gt: 0 } },
      { disposedQuantity: { $gt: 0 } },
      { $expr: { $ne: ['$unusedQuantity', '$producedQuantity'] } }
    ]
  });

  console.log(`Found invalid pending orders: ${invalidPending.length}`);
  if (invalidPending.length > 0) {
    invalidPending.forEach((o) => {
      console.log(
        ` - ${o.batchNumber} (${o._id}) status=${o.status} produced=${o.producedQuantity} inUse=${o.inUseQuantity} disposed=${o.disposedQuantity} unused=${o.unusedQuantity}`
      );
    });

    const ids = invalidPending.map((o) => o._id);
    const delRes = await Order.deleteMany({ _id: { $in: ids } });
    console.log(`Deleted: ${delRes.deletedCount} invalid pending orders`);
  }

  // 驗證是否還有違規的 pending 訂單存在
  const stillInvalid = await Order.countDocuments({
    status: 'pending',
    $or: [
      { inUseQuantity: { $gt: 0 } },
      { disposedQuantity: { $gt: 0 } },
      { $expr: { $ne: ['$unusedQuantity', '$producedQuantity'] } }
    ]
  });
  console.log(`Remaining invalid pending orders: ${stillInvalid}`);

  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch((err) => {
  console.error('fixPendingOrders error:', err);
  process.exit(1);
});

