import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Check students table
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email')
      .limit(5);

    // Check student_users table
    const { data: studentUsers, error: studentUsersError } = await supabase
      .from('student_users')
      .select('id, email, student_id')
      .limit(5);

    // Check academy_supervisors table
    const { data: supervisors, error: supervisorsError } = await supabase
      .from('academy_supervisors')
      .select('id, name, email')
      .limit(5);

    // Check supervisor_users table
    const { data: supervisorUsers, error: supervisorUsersError } = await supabase
      .from('supervisor_users')
      .select('id, email, supervisor_id')
      .limit(5);

    return NextResponse.json({
      students: {
        data: students || [],
        error: studentsError?.message
      },
      studentUsers: {
        data: studentUsers || [],
        error: studentUsersError?.message
      },
      supervisors: {
        data: supervisors || [],
        error: supervisorsError?.message
      },
      supervisorUsers: {
        data: supervisorUsers || [],
        error: supervisorUsersError?.message
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 });
  }
}
