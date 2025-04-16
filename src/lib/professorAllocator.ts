import { Types } from 'mongoose';
import dbConnect from './db';
import Professor, { IProfessor } from '@/models/professor';
import Room, { IRoom } from '@/models/room';
import Schedule, { ISchedule } from '@/models/schedule';
import ProfessorDuty from '@/models/professorDuty';

interface AllocationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Round Robin professor allocation algorithm
 * - Sorts professors by designation seniority
 * - Tracks last assigned professor to continue rotation fairly
 * - Allocates duties evenly across professors
 */
export async function allocateProfessors(): Promise<AllocationResult> {
  try {
    await dbConnect();
    
    // Get all active professors sorted by designation
    const professors = await Professor.find().sort({ 
      designation: 1, // Professor > Associate > Assistant
      dutyCount: 1 // Those with fewer duties get priority
    }).lean();
    
    if (professors.length === 0) {
      return { success: false, error: 'No professors available for allocation' };
    }
    
    // Get all active rooms
    const rooms = await Room.find({ isActive: true }).lean();
    
    if (rooms.length === 0) {
      return { success: false, error: 'No active rooms available for allocation' };
    }
    
    // Get all schedules (exam dates & shifts)
    const schedules = await Schedule.find({ isActive: true }).sort({ date: 1 }).lean();
    
    if (schedules.length === 0) {
      return { success: false, error: 'No exam schedules found for allocation' };
    }
    
    // Find the last allocated professor (for continuing round robin)
    const lastAllocation = await ProfessorDuty.findOne()
      .sort({ createdAt: -1 })
      .populate('professor')
      .lean();
    // Find index of last allocated professor (or start at 0)
    let lastIndex = 0;
    if (lastAllocation && 
        typeof lastAllocation === 'object' && 
        'professor' in lastAllocation && 
        lastAllocation.professor) {
      const professorId = lastAllocation.professor._id;
      if (professorId) {
        lastIndex = professors.findIndex(p => 
          p._id && p._id.toString() === professorId.toString()
        );
        if (lastIndex >= 0) lastIndex = (lastIndex + 1) % professors.length;
      }
    }
    
    // Start allocation
    const allocations = [];
    
    for (const schedule of schedules) {
      // Check if this schedule already has allocations
      const existingAllocations = await ProfessorDuty.find({
        schedule: schedule._id
      }).lean();
      
      if (existingAllocations.length > 0) {
        continue; // Skip if already allocated
      }
      
      // Allocate one professor per room for this schedule
      for (const room of rooms) {
        // Skip allocation if we run out of professors
        if (professors.length === 0) break;
        
        // Get the next professor in rotation
        const professorIndex = lastIndex % professors.length;
        const professor = professors[professorIndex];
        
        // Create the duty allocation
        const duty = {
          professor: professor._id,
          room: room._id,
          schedule: schedule._id,
          date: schedule.date,
          shift: schedule.shift
        };
        
        allocations.push(duty);
        
        // Update professor duty count
        await Professor.findByIdAndUpdate(
          professor._id,
          { $inc: { dutyCount: 1 } }
        );
        
        // Move to next professor in rotation
        lastIndex = (lastIndex + 1) % professors.length;
      }
    }
    
    // Save all allocations to database
    if (allocations.length > 0) {
      await ProfessorDuty.insertMany(allocations);
    }
    
    return { 
      success: true, 
      data: { 
        totalAllocations: allocations.length,
        schedules: schedules.length,
        rooms: rooms.length, 
        professors: professors.length 
      } 
    };
    
  } catch (error) {
    console.error('Professor allocation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during professor allocation' 
    };
  }
} 