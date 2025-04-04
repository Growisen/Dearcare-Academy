import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params;
    
    const { data, error } = await supabase
      .from('students')
      .select('name, email')
      .eq('id', studentId)
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { message: `Failed to fetch student details: ${errorMessage}` },
      { status: 500 }
    );
  }
}
