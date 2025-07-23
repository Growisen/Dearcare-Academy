import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Fetch attendance records for the student
    let query = supabase
      .from('academy_student_attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month), 1).toISOString().split('T')[0];
      const endDate = new Date(parseInt(year), parseInt(month) + 1, 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data: attendanceRecords, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate statistics based on new structure
    const totalSessions = attendanceRecords?.reduce((total, record) => {
      let sessionCount = 0;
      if (record.fn_theory !== null) sessionCount++;
      if (record.fn_practical !== null) sessionCount++;
      if (record.an_theory !== null) sessionCount++;
      if (record.an_practical !== null) sessionCount++;
      return total + sessionCount;
    }, 0) || 0;
    
    const attendedSessions = attendanceRecords?.reduce((total, record) => {
      let attendedCount = 0;
      if (record.fn_theory === true) attendedCount++;
      if (record.fn_practical === true) attendedCount++;
      if (record.an_theory === true) attendedCount++;
      if (record.an_practical === true) attendedCount++;
      return total + attendedCount;
    }, 0) || 0;
    
    const absentSessions = totalSessions - attendedSessions;
    const attendancePercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        records: attendanceRecords || [],
        statistics: {
          totalSessions,
          attendedSessions,
          absentSessions,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100
        },
        period: {
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching student attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}
