import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProfessorDuty from '@/models/professorDuty';
import Professor from '@/models/professor';

// GET - Fetch all professor duties
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const duties = await ProfessorDuty.find()
      .populate('professor', 'name email department')
      .populate('room', 'name capacity')
      .populate('schedule', 'date shift startTime endTime')
      .sort({ 'schedule.date': 1, 'schedule.startTime': 1 })
      .lean();
    
    return NextResponse.json(duties);
  } catch (error: unknown) {
    console.error('Error fetching professor duties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professor duties' }, 
      { status: 500 }
    );
  }
}

// POST - Assign professor to duty
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.professor || !body.room || !body.schedule) {
      return NextResponse.json(
        { error: 'Professor, room, and schedule are required' }, 
        { status: 400 }
      );
    }
    
    // Create new professor duty
    const professorDuty = await ProfessorDuty.create(body);
    
    // Increment the professor's duty count
    await Professor.findByIdAndUpdate(
      body.professor,
      { $inc: { dutyCount: 1 } }
    );
    
    return NextResponse.json(professorDuty, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating professor duty:', error);
    
    // Handle duplicate assignment error
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Professor already assigned to this duty' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create professor duty' }, 
      { status: 500 }
    );
  }
} 