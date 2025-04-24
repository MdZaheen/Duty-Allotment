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
    console.log('Starting professor allocation process...');
    
    // Get all active professors sorted by designation
    const professors = await Professor.find().sort({ 
      designation: 1, // Professor > Associate > Assistant
      dutyCount: 1 // Those with fewer duties get priority
    }).lean();
    
    console.log(`Found ${professors.length} professors`);
    
    if (professors.length === 0) {
      return { success: false, error: 'No professors available for allocation' };
    }
    
    // Get all active rooms
    const rooms = await Room.find({ isActive: true }).lean();
    console.log(`Found ${rooms.length} active rooms`);
    
    if (rooms.length === 0) {
      return { success: false, error: 'No active rooms available for allocation' };
    }
    
    // Get all schedules (exam dates & shifts)
    const schedules = await Schedule.find({ isActive: true }).sort({ date: 1 }).lean();
    console.log(`Found ${schedules.length} active schedules`);
    
    if (schedules.length === 0) {
      return { success: false, error: 'No exam schedules found for allocation' };
    }
    
    // Clear existing duties before allocation
    await ProfessorDuty.deleteMany({});
    console.log('Cleared existing professor duties');
    
    // Reset all professor duty counts to zero
    await Professor.updateMany({}, { dutyCount: 0 });
    console.log('Reset all professor duty counts to zero');
    
    // Verify that the model does not require schedule field
    try {
      // Test the model with a sample duty without schedule
      const testDuty = new ProfessorDuty({
        professor: professors[0]._id,
        room: rooms[0]._id,
        date: new Date(),
        shift: 'Morning',
        startTime: '09:00',
        endTime: '12:00'
      });
      
      // Validate the model
      await testDuty.validate();
      console.log('Model validation successful - proceeding with allocation');
      
      // Remove test duty
      await ProfessorDuty.deleteOne({ _id: testDuty._id });
    } catch (validationError) {
      console.error('Model validation failed:', validationError);
      return { 
        success: false, 
        error: 'The ProfessorDuty model is not configured correctly. Please check your schema.'
      };
    }
    
    // Find the last allocated professor (for continuing round robin)
    let lastIndex = 0;
    
    // Start allocation
    const allocations = [];
    
    for (const schedule of schedules) {
      console.log(`Allocating for schedule: ${schedule.date} - ${schedule.shift}`);
      
      // Allocate one professor per room for this schedule
      for (const room of rooms) {
        // Skip allocation if we run out of professors
        if (professors.length === 0) break;
        
        // Get the next professor in rotation
        const professorIndex = lastIndex % professors.length;
        const professor = professors[professorIndex];
        
        // Create the duty allocation without schedule reference
        const duty = {
          professor: professor._id,
          room: room._id,
          date: schedule.date,
          shift: schedule.shift,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        };
        
        allocations.push(duty);
        
        // Move to next professor in rotation
        lastIndex = (lastIndex + 1) % professors.length;
      }
    }
    
    console.log(`Created ${allocations.length} duty allocations`);
    
    // Save all allocations to database
    if (allocations.length > 0) {
      console.log('Saving allocations to database...');
      try {
        const result = await ProfessorDuty.insertMany(allocations, { ordered: false });
        console.log(`Successfully saved ${result.length} allocations`);
      
        // Update professor duty counts
        for (const duty of allocations) {
          await Professor.findByIdAndUpdate(
            duty.professor,
            { $inc: { dutyCount: 1 } }
          );
        }
      } catch (insertError) {
        console.error('Error inserting duties:', insertError);
        return { 
          success: false, 
          error: insertError instanceof Error ? insertError.message : 'Error saving duties'
        };
      }
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