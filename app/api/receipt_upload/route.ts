import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;

    if (!file || !studentId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const filePath = `Students/${studentId}/payment_receipt.pdf`;
    
    const { error } = await supabase.storage
      .from('DearCare')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Update the student record to mark receipt as uploaded
    const { error: updateError } = await supabase
      .from('students')
      .update({ payment_receipt: true })
      .eq('id', studentId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: 'Receipt uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}