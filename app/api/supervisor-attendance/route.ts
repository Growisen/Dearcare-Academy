import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get('supervisorId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!supervisorId) {
      return NextResponse.json(
        { error: 'Supervisor ID is required' },
        { status: 400 }
      );
    }

    // Fetch assigned students for the supervisor
    const { data: assignedStudents, error: studentsError } = await supabase
      .from('supervisor_assignment')
      .select(`
        student_id,
        students!supervisor_assignment_student_id_fkey (
          id,
          name,
          register_no,
          course,
          email,
          mobile
        )
      `)
      .eq('supervisor_id', supervisorId);

    if (studentsError) {
      throw studentsError;
    }

    // Fetch attendance records for the specific date
    const studentIds = assignedStudents?.map(assignment => assignment.student_id) || [];
    
    let attendanceRecords = [];
    if (studentIds.length > 0) {
      const { data: attendance, error: attendanceError } = await supabase
        .from('academy_student_attendance')
        .select('*')
        .in('student_id', studentIds)
        .eq('date', date);

      if (attendanceError) {
        throw attendanceError;
      }
      
      attendanceRecords = attendance || [];
    }

    // Process and combine data
    const studentsWithAttendance = assignedStudents?.map(assignment => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const student = assignment.students as any;
      const attendanceRecord = attendanceRecords.find(
        record => record.student_id === assignment.student_id
      );

      return {
        id: student?.id || 0,
        name: student?.name || '',
        register_no: student?.register_no || '',
        course: student?.course || '',
        email: student?.email || '',
        mobile: student?.mobile || '',
        attendance: attendanceRecord ? {
          present: attendanceRecord.present,
          marked: true,
          recordId: attendanceRecord.id
        } : {
          present: null,
          marked: false,
          recordId: null
        }
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        students: studentsWithAttendance,
        date,
        totalStudents: studentsWithAttendance.length,
        attendanceMarked: attendanceRecords.length,
        attendanceRemaining: studentsWithAttendance.length - attendanceRecords.length
      }
    });

  } catch (error) {
    console.error('Error fetching supervisor attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supervisorId, studentId, date, present } = body;

    if (!supervisorId || !studentId || !date || present === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: supervisorId, studentId, date, present' },
        { status: 400 }
      );
    }

    // Check if attendance record already exists
    const { data: existing, error: checkError } = await supabase
      .from('academy_student_attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('date', date)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('academy_student_attendance')
        .update({ present })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('academy_student_attendance')
        .insert({
          student_id: studentId,
          date,
          present
        })
        .select();

      if (error) throw error;
      result = data[0];
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Attendance ${existing ? 'updated' : 'recorded'} successfully`
    });

  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}
