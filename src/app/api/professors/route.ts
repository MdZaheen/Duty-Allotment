import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Professor from '@/models/professor';

// GET - Fetch all professors
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const professors = await Professor.find()
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professors' }, 
      { status: 500 }
    );
  }
}

// POST - Create new professor
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.department) {
      return NextResponse.json(
        { error: 'Name, email, and department are required' }, 
        { status: 400 }
      );
    }
    
    // Create new professor
    const professor = await Professor.create({
      ...body,
      dutyCount: body.dutyCount || 0
    });
    
    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    console.error('Error creating professor:', error);
    return NextResponse.json(
      { error: 'Failed to create professor' }, 
      { status: 500 }
    );
  }
} 