import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eolc';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const email = 'AdminMulder';
  const password = 'Gaseik2699@';
  const passwordHash = await bcrypt.hash(password, 10);

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    email,
    passwordHash,
    firstName: 'Admin',
    lastName: 'Mulder',
    role: 'admin',
    emailVerified: true
  });

  console.log('Admin created!');
  process.exit(0);
}

createAdmin(); 