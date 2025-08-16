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
    console.log('[normalize] Connecting MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[normalize] Connected');

    const count = await Order.countDocuments({ status: 'in_production' as any });
    console.log(`[normalize] Found orders with status in_production: ${count}`);

    if (count > 0) {
      const result = await Order.updateMany(
        { status: 'in_production' as any },
        { $set: { status: 'production' } }
      );
      console.log(`[normalize] Modified orders: ${result.modifiedCount ?? (result as any).nModified ?? 0}`);
    }

    const remaining = await Order.countDocuments({ status: 'in_production' as any });
    console.log(`[normalize] Remaining in_production orders: ${remaining}`);
  } catch (err) {
    console.error('[normalize] Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[normalize] Disconnected');
  }
}

main();

