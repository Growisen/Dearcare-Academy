import { NextResponse } from 'next/server';
import { insertCorporateEnquiryData, getVisibleCorporateEnquiries } from '@/lib/supabase';
import { CorporateEnquiryFormData, CorporateEnquiryRecord } from '@/types/corporate-enquiry.types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.organization_type || !body.organization_name || !body.contact_person || 
        !body.designation || !body.email || !body.phone_no || !body.staff_count) {
      return NextResponse.json(
        { error: 'Missing required fields: organization_type, organization_name, contact_person, designation, email, phone_no, and staff_count are required' },
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

    // Validate staff count
    if (body.staff_count && (isNaN(body.staff_count) || body.staff_count < 1 || body.staff_count > 1000)) {
      return NextResponse.json(
        { error: 'Staff count must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Validate organization type
    const validOrgTypes = ['Hospital', 'Old Age Home', 'Clinic', 'Palliative Care', 'Care Home', 'Rehabilitation Center'];
    if (!validOrgTypes.includes(body.organization_type)) {
      return NextResponse.json(
        { error: 'Invalid organization type' },
        { status: 400 }
      );
    }

    // Prepare corporate enquiry data with proper validation
    const corporateEnquiryData: CorporateEnquiryFormData = {
      organization_type: body.organization_type,
      organization_name: body.organization_name.trim(),
      contact_person: body.contact_person.trim(),
      designation: body.designation.trim(),
      email: body.email.trim().toLowerCase(),
      phone_no: body.phone_no.trim(),
      staff_count: parseInt(body.staff_count),
      message: body.message?.trim() || undefined,
    };

    // Insert data
    const { data, error } = await insertCorporateEnquiryData(corporateEnquiryData);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // For now, we'll skip email notifications for corporate enquiries
    // This can be added later if needed
      
    return NextResponse.json(
      { 
        message: 'Corporate enquiry submitted successfully', 
        data
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error processing corporate enquiry:', error);
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
    const organizationType = searchParams.get('organization_type');
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const { data: corporateEnquiries, error } = await getVisibleCorporateEnquiries();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch corporate enquiries' },
        { status: 500 }
      );
    }

    let filteredEnquiries = corporateEnquiries || [];

    // Apply filters
    if (organizationType) {
      filteredEnquiries = filteredEnquiries.filter((e: CorporateEnquiryRecord) => e.organization_type === organizationType);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredEnquiries = filteredEnquiries.filter((e: CorporateEnquiryRecord) => 
        e.organization_name.toLowerCase().includes(searchTerm) ||
        e.contact_person.toLowerCase().includes(searchTerm) ||
        e.email.toLowerCase().includes(searchTerm) ||
        e.phone_no.includes(searchTerm) ||
        e.designation.toLowerCase().includes(searchTerm)
      );
    }

    if (dateRange && dateRange !== '') {
      const now = new Date();
      filteredEnquiries = filteredEnquiries.filter((e: CorporateEnquiryRecord) => {
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
    console.error('Error fetching corporate enquiries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
