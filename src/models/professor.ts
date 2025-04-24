import mongoose from 'mongoose';

export interface IProfessor {
  name: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor';
  email?: string;
  department?: string;
  dutyCount?: number;
}

const ProfessorSchema = new mongoose.Schema<IProfessor>({
  name: { type: String, required: true },
  designation: { 
    type: String, 
    required: true,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor']
  },
  email: { type: String },
  department: { type: String },
  dutyCount: { type: Number, default: 0 }
}, { timestamps: true });

// Add index for query optimization
ProfessorSchema.index({ designation: 1, name: 1 });

// Check if the model already exists to prevent overwriting during hot reloads
const Professor = mongoose.models.Professor as mongoose.Model<IProfessor> || 
  mongoose.model<IProfessor>('Professor', ProfessorSchema);

export default Professor; 