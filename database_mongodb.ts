
import mongoose, { Schema, Document } from 'mongoose';

/**
 * WARD SCHEMA
 * Stores master data for Bengaluru Wards.
 */
export interface IWard extends Document {
  wardNumber: string;
  name: string;
  councillorName: string;
  party: string;
}

const WardSchema: Schema = new Schema({
  wardNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  councillorName: { type: String, required: true },
  party: { type: String, required: true, enum: ['BJP', 'INC', 'JDS', 'Independent'] },
});

/**
 * USER SCHEMA
 * Unified schema for both Citizens and Councillors.
 * Role-based access control is handled by the 'role' field.
 */
export interface IUser extends Document {
  name: string;
  phone: string;
  passwordHash: string;
  role: 'citizen' | 'councillor';
  wardId: string; // References Ward.wardNumber
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['citizen', 'councillor'] },
  wardId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

/**
 * COMPLAINT SCHEMA
 * Stores information about civic issues reported by citizens.
 * Includes AI validation metadata and councillor verification status.
 */
export interface IComplaint extends Document {
  citizenId: mongoose.Types.ObjectId;
  wardId: string;
  description: string;
  imageUrl: string; // URL to storage (e.g., S3 or MongoDB GridFS)
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  aiVerification: {
    isValid: boolean;
    reason: string;
    category: string;
  };
  councillorFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wardId: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING' 
  },
  aiVerification: {
    isValid: { type: Boolean, default: false },
    reason: { type: String },
    category: { type: String }
  },
  councillorFeedback: { type: String },
}, { timestamps: true });

// Models
export const Ward = mongoose.model<IWard>('Ward', WardSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
