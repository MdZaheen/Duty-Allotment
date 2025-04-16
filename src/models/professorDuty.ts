import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface IProfessorDuty {
  professor: Types.ObjectId;
  room: Types.ObjectId;
  schedule: Types.ObjectId;
  date: Date;
  shift: 'Morning' | 'Afternoon' | 'Evening';
}

const ProfessorDutySchema = new mongoose.Schema<IProfessorDuty>({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  date: { type: Date, required: true },
  shift: { 
    type: String, 
    required: true,
    enum: ['Morning', 'Afternoon', 'Evening']
  }
}, { timestamps: true });

// Add unique compound index to prevent duplicate assignments
ProfessorDutySchema.index({ professor: 1, date: 1, shift: 1 }, { unique: true });
ProfessorDutySchema.index({ room: 1, date: 1, shift: 1 }, { unique: true });

export default mongoose.models.ProfessorDuty || mongoose.model<IProfessorDuty>('ProfessorDuty', ProfessorDutySchema); 