
import mongoose, { Schema, Document } from 'mongoose';

// User Schema (Citizen or Councillor)
export interface IUser extends Document {
  name: string;
  phone: string;
  passwordHash: string;
  role: 'citizen' | 'councillor';
  wardId: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['citizen', 'councillor'] },
  wardId: { type: String, required: true }, // References Ward.id
  createdAt: { type: Date, default: Date.now },
});

// Ward Schema
export interface IWard extends Document {
  id: string; // Ward Number
  name: string;
  councillorName: string;
  party: string;
}

const WardSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  councillorName: { type: String, required: true },
  party: { type: String, required: true },
});

// Problem Report Schema
export interface IReport extends Document {
  reportId: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  wardId: string;
  description: string;
  image: string; // Base64 or URL
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  aiVerificationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  wardId: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  aiVerificationReason: { type: String },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
export const Ward = mongoose.model<IWard>('Ward', WardSchema);
export const Report = mongoose.model<IReport>('Report', ReportSchema);
