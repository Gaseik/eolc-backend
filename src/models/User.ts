import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'manufacturer' | 'regulator' | 'endUser';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId?: mongoose.Types.ObjectId | string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes: string[];
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  settings?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    }
  };
  orgRole?: 'admin' | 'member';
  status?: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manufacturer', 'regulator', 'endUser'], required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  phone: { type: String },
  avatarUrl: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  backupCodes: { type: [String], default: [] },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  orgRole: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);