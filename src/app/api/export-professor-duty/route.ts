import { NextRequest, NextResponse } from 'next/server';
import { exportProfessorDuty } from '@/lib/excelExport';
import mongoose from 'mongoose';

// Helper function to reset models
async function resetModels() {
  // Try to delete specific models that might be causing issues
  try {
    if (mongoose.models.ProfessorDuty) {
      delete mongoose.models.ProfessorDuty;
      console.log('Successfully deleted ProfessorDuty model');
    }
  } catch (err) {
    console.error('Error deleting model:', err);
  }
  
  // Re-import to recreate
  const { default: ProfessorDuty } = await import('@/models/professorDuty');
  return true;
}

export async function GET(req: NextRequest) {
  try {
    // Reset models first
    await resetModels();
    
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