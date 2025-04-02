import { NextResponse } from 'next/server';
import { insertStudentData } from '../../../lib/supabase';
import { StudentFormData } from '../../../../types/student.types';

export async function POST(request: Request) {
  try {
    const data: StudentFormData = await request.json();

    // Validate required fields
    if (!data.fullName || !data.dateOfBirth || !data.email || !data.mobileNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert student data using the existing function
    const { studentId, error } = await insertStudentData(data);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Student registered successfully',
      studentId
    }, { status: 201 });

  } catch (error) {
    console.error('Error in student registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



export async function GET() {
  return NextResponse.json(
    { message: 'Student registration API endpoint' },
    { status: 200 }
  );
}