import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface AttendanceUpdateData {
  fn_theory?: boolean;
  an_theory?: boolean;
  fn_practical?: boolean;
  an_practical?: boolean;
}

interface AttendanceInsertData {
  student_id: number;
  date: string;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
}

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
    const { studentId, date, session, type, isPresent } = body;

    // supervisorId is now optional (admin can update any attendance)
    if (!studentId || !date || !session || !type || isPresent === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, date, session, type, isPresent' },
        { status: 400 }
      );
    }

    // Check if attendance record already exists
    const { data: existing, error: checkError } = await supabase
      .from('academy_student_attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', date)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;
    
    if (existing) {
      // Update existing record
      const updateData: AttendanceUpdateData = {};
      
      // Set the specific field based on session and type
      if (session === 'fn' && type === 'theory') {
        updateData.fn_theory = isPresent;
      } else if (session === 'fn' && type === 'practical') {
        updateData.fn_practical = isPresent;
      } else if (session === 'an' && type === 'theory') {
        updateData.an_theory = isPresent;
      } else if (session === 'an' && type === 'practical') {
        updateData.an_practical = isPresent;
      }
      
      // Implement mutual exclusion logic
      if (isPresent) {
        if (session === 'fn') {
          if (type === 'theory') {
            updateData.fn_practical = false;
          } else {
            updateData.fn_theory = false;
          }
        } else {
          if (type === 'theory') {
            updateData.an_practical = false;
          } else {
            updateData.an_theory = false;
          }
        }
      }
      
      const { data, error } = await supabase
        .from('academy_student_attendance')
        .update(updateData)
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Create new record
      const insertData: AttendanceInsertData = {
        student_id: studentId,
        date,
        fn_theory: false,
        an_theory: false,
        fn_practical: false,
        an_practical: false
      };
      
      // Set the specific field based on session and type
      if (session === 'fn' && type === 'theory') {
        insertData.fn_theory = isPresent;
      } else if (session === 'fn' && type === 'practical') {
        insertData.fn_practical = isPresent;
      } else if (session === 'an' && type === 'theory') {
        insertData.an_theory = isPresent;
      } else if (session === 'an' && type === 'practical') {
        insertData.an_practical = isPresent;
      }
      
      // Implement mutual exclusion logic for new records
      if (isPresent) {
        if (session === 'fn') {
          if (type === 'theory') {
            insertData.fn_practical = false;
          } else {
            insertData.fn_theory = false;
          }
        } else {
          if (type === 'theory') {
            insertData.an_practical = false;
          } else {
            insertData.an_theory = false;
          }
        }
      }

      const { data, error } = await supabase
        .from('academy_student_attendance')
        .insert(insertData)
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
