import { NextRequest, NextResponse } from 'next/server';
import { exportProfessorDuty } from '@/lib/excelExport';

export async function GET(req: NextRequest) {
  try {
    const buffer = await exportProfessorDuty();
    
    // Set appropriate headers for Excel file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="professor_duty_chart.xlsx"`);
    
    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Professor duty export error:', error);
    return NextResponse.json(
      { error: 'Failed to export professor duty chart' }, 
      { status: 500 }
    );
  }
} 