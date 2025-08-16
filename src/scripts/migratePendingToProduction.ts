import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../models/Order';

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGO_URI/MONGODB_URI environment variable');
    process.exit(1);
  }

  try {
    console.log('[migrate] Connecting MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[migrate] Connected');

    const pendingCount = await Order.countDocuments({ status: 'pending' });
    console.log(`[migrate] Found pending orders: ${pendingCount}`);

    if (pendingCount === 0) {
      console.log('[migrate] No pending orders to update.');
      await mongoose.disconnect();
      return;
    }

    const result = await Order.updateMany(
      { status: 'pending' },
      { $set: { status: 'production' } }
    );

    console.log(`[migrate] Modified orders: ${result.modifiedCount ?? (result as any).nModified ?? 0}`);

    const remainingPending = await Order.countDocuments({ status: 'pending' });
    console.log(`[migrate] Remaining pending orders: ${remainingPending}`);
  } catch (err) {
    console.error('[migrate] Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[migrate] Disconnected');
  }
}

main();

