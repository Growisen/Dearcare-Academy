import { NextResponse } from 'next/server';
import { confirmation_mail } from '../../../../lib/mail';
import {createAccount} from '../../../../lib/createAccount';

export async function POST(req: Request) {
  try {
    const { name, email, courseName, id } = await req.json();

    // Send confirmation email
    const result = await confirmation_mail({ name, email, courseName });

    if (!result.success) {
      throw new Error(result.message);
    }

    await createAccount({email:email,password:'student@123',role:'student', id:id});

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
