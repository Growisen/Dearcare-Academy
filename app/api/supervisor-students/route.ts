import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get('supervisorId');

    if (!supervisorId) {
      return NextResponse.json(
        { error: 'Supervisor ID is required' },
        { status: 400 }
      );
    }

    // Fetch assigned students for the supervisor
    const { data: assignedStudents, error } = await supabase
      .from('supervisor_assignment')
      .select(`
        student_id,
        created_at,
        students!supervisor_assignment_student_id_fkey (
          id,
          name,
          register_no,
          course,
          email,
          mobile,
          created_at,
          student_source!student_source_student_id_fkey (
            status,
            priority,
            category,
            sub_category
          )
        )
      `)
      .eq('supervisor_id', supervisorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process the data
    const students = assignedStudents?.map(assignment => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const student = assignment.students as any;
      const source = student?.student_source?.[0] || {};
      
      return {
        id: student?.id || 0,
        name: student?.name || '',
        register_no: student?.register_no || '',
        course: student?.course || '',
        email: student?.email || '',
        mobile: student?.mobile || '',
        status: source.status || 'new',
        priority: source.priority || 'normal',
        category: source.category || '',
        sub_category: source.sub_category || '',
        enrollment_date: student?.created_at || assignment.created_at,
        assignment_date: assignment.created_at
      };
    }).filter(student => student.id > 0) || [];

    // Calculate statistics
    const stats = {
      total: students.length,
      confirmed: students.filter(s => s.status?.toLowerCase() === 'confirmed').length,
      followUp: students.filter(s => s.status?.toLowerCase() === 'follow-up').length,
      new: students.filter(s => s.status?.toLowerCase() === 'new').length,
      rejected: students.filter(s => s.status?.toLowerCase() === 'rejected').length,
      highPriority: students.filter(s => s.priority?.toLowerCase() === 'high').length
    };

    return NextResponse.json({
      success: true,
      data: {
        students,
        statistics: stats,
        supervisorId: parseInt(supervisorId)
      }
    });

  } catch (error) {
    console.error('Error fetching supervisor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students data' },
      { status: 500 }
    );
  }
}
