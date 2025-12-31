
import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  wardId: string;
  description: string;
  image: string;
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

export const Report = mongoose.model<IReport>('Report', ReportSchema);
