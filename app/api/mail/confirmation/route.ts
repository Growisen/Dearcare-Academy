import { NextResponse } from 'next/server';
import { confirmation_mail } from '../../../lib/mail';

export async function POST(req: Request) {
  try {
    const { name, email, courseName } = await req.json();

    // Send confirmation email
    const result = await confirmation_mail({ name, email, courseName });

    if (!result.success) {
      throw new Error(result.message);
    }

    return NextResponse.json({ success: true, message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send confirmation email',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
