import mongoose, { Schema, Document } from 'mongoose';

export type OrganizationType = 'manufacturer' | 'regulator' | 'endUser';

export interface IOrganization extends Document {
  name: string;
  type: OrganizationType;
  address?: string; // 新增地址欄位，非必填
  members: mongoose.Types.ObjectId[]; // User IDs
  status: 'active' | 'inactive';
  invitations: {
    email: string;
    invitedBy: mongoose.Types.ObjectId;
    invitedAt: Date;
    accepted: boolean;
    acceptedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  type: { type: String, enum: ['manufacturer', 'regulator', 'endUser'], required: true },
  address: { type: String }, // 新增地址欄位，非必填
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  invitations: [{
    email: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedAt: { type: Date, default: Date.now },
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrganization>('Organization', OrganizationSchema); 