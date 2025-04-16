import mongoose from 'mongoose';

export interface IRoom {
  number: string;
  capacity: number;
  building?: string;
  floor?: number;
  isActive: boolean;
}

const RoomSchema = new mongoose.Schema<IRoom>({
  number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  building: { type: String },
  floor: { type: Number },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Add index for query optimization
RoomSchema.index({ number: 1 });
RoomSchema.index({ capacity: -1 });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema); 