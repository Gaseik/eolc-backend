import mongoose, { Schema, Document } from 'mongoose';

export type OrganizationType = 'manufacturer' | 'regulator' | 'endUser';

export interface IOrganization extends Document {
  name: string;
  type: OrganizationType;
  address?: string;
  taxId?: string; // 稅號
  email?: string; // 組織聯絡郵箱
  contactPhone?: string; // 組織聯絡電話
  website?: string; // 組織網站
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
  address: { type: String }, // 地址，非必填
  taxId: { type: String }, // 稅號，非必填
  email: { type: String }, // 組織聯絡郵箱，非必填
  contactPhone: { type: String }, // 組織聯絡電話，非必填
  website: { type: String }, // 組織網站，非必填
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