import { NextResponse } from 'next/server';
import { hideCorporateEnquiry } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid enquiry ID' },
        { status: 400 }
      );
    }

    const { error } = await hideCorporateEnquiry(id);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Corporate enquiry deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting corporate enquiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
