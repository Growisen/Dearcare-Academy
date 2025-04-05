import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { receipt_upload } from '../../lib/mail';

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json();

    // Get student and course details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        name,
        email,
        course,
        courses:course!inner (
          course_name,
          course_fees,
          reg_fees
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Ensure courses data exists and get the first course
    if (!student.courses) {
      throw new Error('No course information found for student');
    }

    // Update student status
    const { error: updateError } = await supabase
      .from('student_source')
      .update({ status: 'follow-up' })
      .eq('student_id', studentId);

    if (updateError) throw updateError;

    // Send email with course details
    await receipt_upload({
      name: student.name,
      email: student.email,
      courseName: student.courses[0].course_name,
      courseFees: student.courses[0].course_fees,
      regFees: student.courses[0].reg_fees,
      studentId: studentId 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Student verified and email sent successfully' 
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify student', error },
      { status: 500 }
    );
  }
}
