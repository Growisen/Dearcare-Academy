import { NextResponse } from 'next/server';
import { insertEnquiryData, getCourses, getCourseDetails } from '@/lib/supabase';
import { EnquiryFormData } from '@/types/enquiry.types';
import { enquiry_reply } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone_no || !body.course) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch valid courses and validate
    const { data: validCourses, error: coursesError } = await getCourses();
    
    if (coursesError || !validCourses) {
      return NextResponse.json(
        { error: 'Failed to validate course' },
        { status: 500 }
      );
    }

    if (!validCourses.includes(body.course)) {
      return NextResponse.json(
        { error: 'Invalid course selection' },
        { status: 400 }
      );
    }

    // Get course details including fees
    const { data: courseDetails, error: courseDetailsError } = await getCourseDetails(body.course);
    
    if (courseDetailsError || !courseDetails) {
      return NextResponse.json(
        { error: 'Failed to fetch course details' },
        { status: 500 }
      );
    }

    // Insert data
    const { data, error } = await insertEnquiryData(body as EnquiryFormData);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Send email with course fees
    const { success } = await enquiry_reply({
      email: body.email,
      name: body.name,
      courseName: body.course,
      courseFees: courseDetails.course_fees,
      regFees: courseDetails.reg_fees
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }
      

    return NextResponse.json(
      { message: 'Enquiry submitted successfully', data },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
