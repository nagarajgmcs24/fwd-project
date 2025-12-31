
import mongoose, { Schema, Document } from 'mongoose';

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

export const Ward = mongoose.model<IWard>('Ward', WardSchema);
