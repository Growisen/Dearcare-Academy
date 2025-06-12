import { supabase } from './supabase';

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'student' | 'supervisor';
  name?: string;
  register_no?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  redirectTo?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Authenticate user across all three user types
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
  const { email, password } = credentials;

  try {
    // First, try student authentication
    const studentResult = await authenticateStudent(email, password);
    if (studentResult.success) {
      return {
        ...studentResult,
        redirectTo: '/student-dashboard'
      };
    }

    // Second, try supervisor authentication
    const supervisorResult = await authenticateSupervisor(email, password);
    if (supervisorResult.success) {
      return {
        ...supervisorResult,
        redirectTo: '/supervisor-dashboard'
      };
    }

    // Finally, try admin authentication via Supabase
    const adminResult = await authenticateAdmin(email, password);
    if (adminResult.success) {
      return {
        ...adminResult,
        redirectTo: '/dashboard'
      };
    }

    return {
      success: false,
      error: 'Invalid email or password'
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed. Please try again.'
    };
  }
}

// Authenticate student using student_users table
async function authenticateStudent(email: string, password: string): Promise<AuthResult> {
  try {
    const { data: studentUser, error } = await supabase
      .from('student_users')
      .select(`
        id,
        email,
        password,
        student_id,
        students!student_users_student_id_fkey (
          name,
          register_no
        )
      `)
      .eq('email', email)
      .single();

    if (error || !studentUser) {
      return { success: false };
    }    // Verify password (plain text comparison since DB stores plain text)
    if (password !== studentUser.password) {
      return { success: false };
    }

    const student = Array.isArray(studentUser.students) ? studentUser.students[0] : studentUser.students;

    return {
      success: true,
      user: {
        id: studentUser.student_id,
        email: studentUser.email,
        role: 'student',
        name: student?.name,
        register_no: student?.register_no
      }
    };
  } catch (error) {
    console.error('Student authentication error:', error);
    return { success: false };
  }
}

// Authenticate supervisor using supervisor_users table
async function authenticateSupervisor(email: string, password: string): Promise<AuthResult> {
  try {
    const { data: supervisorUser, error } = await supabase
      .from('supervisor_users')
      .select(`
        id,
        email,
        password,
        supervisor_id,
        academy_supervisors!supervisor_users_supervisor_id_fkey (
          name,
          role
        )
      `)
      .eq('email', email)
      .single();

    if (error || !supervisorUser) {
      return { success: false };
    }    // Verify password (plain text comparison since DB stores plain text)
    if (password !== supervisorUser.password) {
      return { success: false };
    }

    const supervisor = Array.isArray(supervisorUser.academy_supervisors) ? supervisorUser.academy_supervisors[0] : supervisorUser.academy_supervisors;

    return {
      success: true,
      user: {
        id: supervisorUser.supervisor_id,
        email: supervisorUser.email,
        role: 'supervisor',
        name: supervisor?.name
      }
    };
  } catch (error) {
    console.error('Supervisor authentication error:', error);
    return { success: false };
  }
}

// Authenticate admin using existing Supabase auth
async function authenticateAdmin(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return { success: false };
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from('academy_roles')
      .select('role')
      .eq('uid', data.user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      await supabase.auth.signOut();
      return { success: false };
    }

    return {
      success: true,
      user: {
        id: parseInt(data.user.id),
        email: data.user.email!,
        role: 'admin'
      }
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { success: false };
  }
}

// Session management for non-admin users
export function setUserSession(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userSession', JSON.stringify(user));
    // Also set as cookie for middleware
    document.cookie = `userSession=${JSON.stringify(user)}; path=/; max-age=86400; samesite=strict`;
  }
}

export function getUserSession(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
  }
  return null;
}

export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userSession');
    // Clear cookie
    document.cookie = 'userSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

// Check authentication status
export async function checkAuthStatus(): Promise<AuthUser | null> {
  // First check for Supabase session (admin)
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: userRole } = await supabase
      .from('academy_roles')
      .select('role')
      .eq('uid', session.user.id)
      .single();

    if (userRole && userRole.role === 'admin') {
      return {
        id: parseInt(session.user.id),
        email: session.user.email!,
        role: 'admin'
      };
    }
  }

  // Check for student/supervisor session
  return getUserSession();
}

// Logout function
export async function logout(): Promise<void> {
  // Clear Supabase session
  await supabase.auth.signOut();
  
  // Clear local session
  clearUserSession();
}