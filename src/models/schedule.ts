import mongoose from 'mongoose';

export interface ISchedule {
  date: Date;
  shift: 'Morning' | 'Afternoon' | 'Evening';
  startTime: string;
  endTime: string;
  subjects?: string[];
  isActive: boolean;
}

const ScheduleSchema = new mongoose.Schema<ISchedule>({
  date: { type: Date, required: true },
  shift: { 
    type: String, 
    required: true,
    enum: ['Morning', 'Afternoon', 'Evening']
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subjects: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Add index for query optimization
ScheduleSchema.index({ date: 1, shift: 1 }, { unique: true });

export default mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema); 