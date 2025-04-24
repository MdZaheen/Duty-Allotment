import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Professor from '@/models/professor';

// GET - Fetch all professors
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/professors: Connecting to database');
    await dbConnect();
    
    console.log('GET /api/professors: Fetching professors');
    const professors = await Professor.find()
      .sort({ name: 1 })
      .lean();
    
    console.log(`GET /api/professors: Found ${professors.length} professors`);
    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professors', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

// POST - Create new professor
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/professors: Connecting to database');
    await dbConnect();
    
    const body = await req.json();
    console.log('POST /api/professors: Request body', body);
    
    // Validate required fields
    if (!body.name || !body.designation) {
      console.log('POST /api/professors: Missing required fields');
      return NextResponse.json(
        { error: 'Name and designation are required' }, 
        { status: 400 }
      );
    }
    
    // Create new professor
    console.log('POST /api/professors: Creating new professor');
    const professor = await Professor.create({
      ...body,
      dutyCount: body.dutyCount || 0
    });
    
    console.log('POST /api/professors: Created professor', professor._id);
    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    console.error('Error creating professor:', error);
    return NextResponse.json(
      { error: 'Failed to create professor', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 