import { NextResponse } from 'next/server';
import { insertEnquiryData } from '@/app/lib/supabase';
import { EnquiryFormData, COURSES } from '@/types/enquiry.types';
//import { enquiry_reply } from '@/app/lib/mail';

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

    // Validate course
    if (!COURSES.includes(body.course)) {
      return NextResponse.json(
        { error: 'Invalid course selection' },
        { status: 400 }
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
    //mail
    /*
    const { success} = await enquiry_reply({to: body.email, name: body.name, courseName: body.course, message: "test course" });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }
      */

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
