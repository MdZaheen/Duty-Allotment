import { Types } from 'mongoose';
import dbConnect from './db';
import Student, { IStudent } from '@/models/student';
import Room, { IRoom } from '@/models/room';
import Schedule, { ISchedule } from '@/models/schedule';
import Subject, { ISubject } from '@/models/subject';
import StudentAllocation from '@/models/studentAllocation';

interface AllocationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Section-wise student allocation algorithm
 * - Groups students by section
 * - Allocates full sections to rooms when possible
 * - Splits sections across rooms when needed
 * - Sorts students by USN for easy seating
 */
export async function allocateStudents(
  scheduleId: string, 
  subjectId: string
): Promise<AllocationResult> {
  try {
    await dbConnect();
    
    // Get schedule details
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return { success: false, error: 'Exam schedule not found' };
    }
    
    // Get subject details
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return { success: false, error: 'Subject not found' };
    }
    
    // Get all active rooms sorted by capacity (largest first)
    const rooms = await Room.find({ isActive: true }).sort({ capacity: -1 }).lean();
    if (rooms.length === 0) {
      return { success: false, error: 'No active rooms available for allocation' };
    }
    
    // Get all students for the specified subject (matching semester and branch)
    const students = await Student.find({
      semester: subject.semester,
      branch: subject.branch
    }).sort({ section: 1, usn: 1 }).lean();
    
    if (students.length === 0) {
      return { success: false, error: 'No students found for the specified subject' };
    }
    
    // Group students by section
    const sections: { [key: string]: any[] } = {};
    students.forEach(student => {
      if (!sections[student.section]) {
        sections[student.section] = [];
      }
      sections[student.section].push(student);
    });
    
    // Start allocation
    const allocations = [];
    let currentRoomIndex = 0;
    let currentSeatNumber = 1;
    
    // Process each section
    for (const section of Object.keys(sections)) {
      const sectionStudents = sections[section];
      
      // Sort students by USN
      sectionStudents.sort((a, b) => a.usn.localeCompare(b.usn));
      
      // Try to fit entire section in one room if possible
      for (let i = 0; i < sectionStudents.length; i++) {
        const student = sectionStudents[i];
        
        // If current room is full, move to next room
        if (currentSeatNumber > rooms[currentRoomIndex].capacity) {
          currentRoomIndex++;
          currentSeatNumber = 1;
          
          // If we run out of rooms, return error
          if (currentRoomIndex >= rooms.length) {
            return { 
              success: false, 
              error: 'Not enough room capacity for all students',
              data: { 
                allocatedStudents: allocations.length,
                remainingStudents: students.length - allocations.length
              }
            };
          }
        }
        
        // Create student allocation
        const allocation = {
          student: student._id,
          room: rooms[currentRoomIndex]._id,
          schedule: schedule._id,
          subject: subject._id,
          seatNumber: currentSeatNumber,
          attendance: false,
          ciaMarks: {
            cia1: null,
            cia2: null,
            cia3: null
          }
        };
        
        allocations.push(allocation);
        currentSeatNumber++;
      }
    }
    
    // Save all allocations to database
    if (allocations.length > 0) {
      // Delete any existing allocations for this schedule and subject
      await StudentAllocation.deleteMany({
        schedule: schedule._id,
        subject: subject._id
      });
      
      // Insert new allocations
      await StudentAllocation.insertMany(allocations);
    }
    
    return { 
      success: true, 
      data: { 
        totalAllocations: allocations.length,
        sections: Object.keys(sections).length,
        rooms: rooms.length,
        students: students.length
      } 
    };
    
  } catch (error) {
    console.error('Student allocation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during student allocation' 
    };
  }
} 