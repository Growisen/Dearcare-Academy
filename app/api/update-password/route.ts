import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, userType, currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!userId || !userType || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate userType
    if (!['student', 'supervisor'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Determine the table to query based on user type
    const tableName = userType === 'student' ? 'student_users' : 'supervisor_users';
    const idField = userType === 'student' ? 'student_id' : 'supervisor_id';

    // First, verify the current password
    const { data: user, error: fetchError } = await supabase
      .from(tableName)
      .select('password')
      .eq(idField, userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password (plain text comparison)
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update the password
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ password: newPassword })
      .eq(idField, userId);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
