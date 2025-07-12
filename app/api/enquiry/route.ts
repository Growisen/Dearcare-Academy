import { NextResponse } from 'next/server';
import { insertEnquiryData, getCourses, getCourseDetails, getVisibleEnquiries } from '@/lib/supabase';
import { EnquiryFormData } from '@/types/enquiry.types';
import { enquiry_reply } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone_no || !body.course) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone_no, and course are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (body.phone_no && !phoneRegex.test(body.phone_no.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    // Validate age if provided
    if (body.age && (isNaN(body.age) || body.age < 16 || body.age > 70)) {
      return NextResponse.json(
        { error: 'Age must be between 16 and 70 years' },
        { status: 400 }
      );
    }

    // Validate Aadhaar number format if provided
    if (body.aadhaar_no && !/^[0-9]{12}$/.test(body.aadhaar_no.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Aadhaar number must be exactly 12 digits' },
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

    // Prepare enquiry data with proper validation
    const enquiryData: EnquiryFormData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone_no: body.phone_no.trim(),
      course: body.course,
      age: body.age ? parseInt(body.age) : undefined,
      dob: body.dob || undefined,
      address: body.address?.trim() || undefined,
      gender: body.gender || undefined,
      religion: body.religion?.trim() || undefined,
      caste: body.caste?.trim() || undefined,
      aadhaar_no: body.aadhaar_no?.trim() || undefined,
      guardian_name: body.guardian_name?.trim() || undefined,
      highest_qualification: body.highest_qualification?.trim() || undefined,
      year_of_passing: body.year_of_passing ? parseInt(body.year_of_passing) : undefined,
    };

    // Insert data
    const { data, error } = await insertEnquiryData(enquiryData);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Send email with course fees
    const { success } = await enquiry_reply({
      email: enquiryData.email,
      name: enquiryData.name,
      courseName: enquiryData.course,
      courseFees: courseDetails.course_fees,
      regFees: courseDetails.reg_fees,
      first_installment: courseDetails.first_installment,
      second_installment: courseDetails.second_installment,
      third_installment: courseDetails.third_installment,
    });
    
    if (!success) {
      console.warn('Failed to send confirmation email, but enquiry was saved successfully');
    }
      
    return NextResponse.json(
      { 
        message: 'Enquiry submitted successfully', 
        data,
        emailSent: success 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error processing enquiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');
    const search = searchParams.get('search');
    const ageRange = searchParams.get('ageRange');
    const dateRange = searchParams.get('dateRange');
    const gender = searchParams.get('gender');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const { data: enquiries, error } = await getVisibleEnquiries();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch enquiries' },
        { status: 500 }
      );
    }

    let filteredEnquiries = enquiries || [];

    // Apply filters
    if (course) {
      filteredEnquiries = filteredEnquiries.filter(e => e.course === course);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredEnquiries = filteredEnquiries.filter(e => 
        e.name.toLowerCase().includes(searchTerm) ||
        e.email.toLowerCase().includes(searchTerm) ||
        e.phone_no.includes(searchTerm) ||
        (e.guardian_name && e.guardian_name.toLowerCase().includes(searchTerm))
      );
    }

    if (ageRange && ageRange !== '') {
      filteredEnquiries = filteredEnquiries.filter(e => {
        if (!e.age) return false;
        switch (ageRange) {
          case '18-25': return e.age >= 18 && e.age <= 25;
          case '26-35': return e.age >= 26 && e.age <= 35;
          case '36-45': return e.age >= 36 && e.age <= 45;
          case '46+': return e.age >= 46;
          default: return true;
        }
      });
    }

    if (dateRange && dateRange !== '') {
      const now = new Date();
      filteredEnquiries = filteredEnquiries.filter(e => {
        const enquiryDate = new Date(e.created_at);
        switch (dateRange) {
          case 'today':
            return enquiryDate.toDateString() === now.toDateString();
          case 'week':
            return enquiryDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return enquiryDate.getMonth() === now.getMonth() && enquiryDate.getFullYear() === now.getFullYear();
          case 'year':
            return enquiryDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    if (gender) {
      filteredEnquiries = filteredEnquiries.filter(e => e.gender === gender);
    }

    // Apply pagination
    const totalCount = filteredEnquiries.length;
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = offset ? parseInt(offset) : 0;
      filteredEnquiries = filteredEnquiries.slice(offsetNum, offsetNum + limitNum);
    }

    return NextResponse.json({
      success: true,
      data: filteredEnquiries,
      totalCount,
      pagination: {
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : 0,
        hasMore: limit ? totalCount > (parseInt(offset || '0') + parseInt(limit)) : false
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching enquiries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
