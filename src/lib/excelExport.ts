import Excel from 'exceljs';
import { format } from 'date-fns';
import ProfessorDuty from '@/models/professorDuty';
import StudentAllocation from '@/models/studentAllocation';
import dbConnect from './db';

/**
 * Export professor duty allocations to Excel
 */
export async function exportProfessorDuty() {
  await dbConnect();
  
  // Create a new workbook and worksheet
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Professor Duties');
  
  // Define the columns
  worksheet.columns = [
    { header: 'Professor Name', key: 'professorName', width: 25 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Shift', key: 'shift', width: 15 },
    { header: 'Room Number', key: 'roomNumber', width: 15 },
    { header: 'Start Time', key: 'startTime', width: 15 },
    { header: 'End Time', key: 'endTime', width: 15 },
  ];
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  try {
    // Get all duties with populated fields - no more schedule field
    const duties = await ProfessorDuty.find()
      .populate('professor')
      .populate('room')
      .sort({ date: 1, shift: 1 })
      .lean();
    
    console.log(`Exporting ${duties.length} professor duties`);
    
    if (duties.length === 0) {
      // Add a default "no data" row
      worksheet.addRow({
        professorName: 'No duties found',
        designation: '',
        date: '',
        shift: '',
        roomNumber: '',
        startTime: '',
        endTime: ''
      });
    } else {
      // Add each duty as a row
      duties.forEach(duty => {
        if (!duty.professor || !duty.room) {
          console.warn('Skipping duty with missing professor or room:', duty._id);
          return;
        }
        
        worksheet.addRow({
          professorName: duty.professor.name,
          designation: duty.professor.designation,
          date: format(new Date(duty.date), 'dd-MM-yyyy'),
          shift: duty.shift,
          roomNumber: duty.room.number,
          startTime: duty.startTime || 'N/A',
          endTime: duty.endTime || 'N/A'
        });
      });
    }
    
    // Configure borders
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Create a buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error generating professor duty Excel file:', error);
    throw error;
  }
}

/**
 * Export student room allocations to Excel
 */
export async function exportStudentAllocation(scheduleId: string, subjectId: string) {
  await dbConnect();
  
  // Create a new workbook and worksheet
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Student Allocations');
  
  // Define the columns
  worksheet.columns = [
    { header: 'Room Number', key: 'roomNumber', width: 15 },
    { header: 'Seat Number', key: 'seatNumber', width: 12 },
    { header: 'USN', key: 'usn', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Section', key: 'section', width: 10 },
    { header: 'Subject Code', key: 'subjectCode', width: 15 },
    { header: 'Subject Name', key: 'subjectName', width: 20 },
    { header: 'CIA-1', key: 'cia1', width: 8 },
    { header: 'CIA-2', key: 'cia2', width: 8 },
    { header: 'CIA-3', key: 'cia3', width: 8 },
    { header: 'Attendance', key: 'attendance', width: 12 },
    { header: 'Invigilator', key: 'invigilator', width: 15 },
  ];
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Get all allocations with populated fields
  const query: any = { };
  if (scheduleId) query.schedule = scheduleId;
  if (subjectId) query.subject = subjectId;
  
  const allocations = await StudentAllocation.find(query)
    .populate('student')
    .populate('room')
    .populate('schedule')
    .populate('subject')
    .sort({ 'room.number': 1, seatNumber: 1 })
    .lean();
  
  // Add each allocation as a row
  allocations.forEach(allocation => {
    worksheet.addRow({
      roomNumber: allocation.room.number,
      seatNumber: allocation.seatNumber,
      usn: allocation.student.usn,
      name: allocation.student.name,
      section: allocation.student.section,
      subjectCode: allocation.subject.code,
      subjectName: allocation.subject.name,
      cia1: allocation.ciaMarks?.cia1 || '',
      cia2: allocation.ciaMarks?.cia2 || '',
      cia3: allocation.ciaMarks?.cia3 || '',
      attendance: allocation.attendance ? 'Present' : '',
      invigilator: ''  // Empty cell for invigilator to sign
    });
  });
  
  // Configure borders
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  // Create a buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
} 