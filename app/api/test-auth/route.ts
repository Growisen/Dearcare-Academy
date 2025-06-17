import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'create_test_users') {
      // Use plain text password since DB stores them as plain text
      const plainPassword = 'password123';

      // Create test student user
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, email')
        .limit(1)
        .single();

      if (!studentError && studentData?.email) {        await supabase
          .from('student_users')
          .upsert({
            student_id: studentData.id,
            email: studentData.email,
            password: plainPassword
          }, {
            onConflict: 'student_id'
          });
      }

      // Create test supervisor user
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('academy_supervisors')
        .select('id, email')
        .limit(1)
        .single();

      if (!supervisorError && supervisorData?.email) {        await supabase
          .from('supervisor_users')
          .upsert({
            supervisor_id: supervisorData.id,
            email: supervisorData.email,
            password: plainPassword
          }, {
            onConflict: 'supervisor_id'
          });
      }

      return NextResponse.json({
        success: true,
        message: 'Test users created successfully',
        credentials: {
          password: 'password123',
          studentEmail: studentData?.email,
          supervisorEmail: supervisorData?.email
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error creating test users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
