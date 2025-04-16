import { NextRequest, NextResponse } from 'next/server';
import { allocateProfessors } from '@/lib/professorAllocator';

export async function POST(req: NextRequest) {
  try {
    const result = await allocateProfessors();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to allocate professors' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Professor allocation API error:', error);
    return NextResponse.json(
      { error: 'Failed to process professor allocation' }, 
      { status: 500 }
    );
  }
} 