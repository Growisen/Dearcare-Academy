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

// Authenticate admin using existing Supabase auth with tab isolation
async function authenticateAdmin(email: string, password: string): Promise<AuthResult> {
  try {
    // Create a new Supabase client instance for this tab to avoid global session conflicts
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const tabSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await tabSupabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return { success: false };
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await tabSupabase
      .from('academy_roles')
      .select('role')
      .eq('uid', data.user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      await tabSupabase.auth.signOut();
      return { success: false };
    }

    // Store admin session in tab-specific storage instead of using global Supabase session
    const adminUser = {
      id: parseInt(data.user.id),
      email: data.user.email!,
      role: 'admin' as const
    };

    // Store admin session using the same tab isolation mechanism
    setUserSession(adminUser);
    
    // Also store the Supabase session data for admin-specific operations
    if (typeof window !== 'undefined') {
      const tabId = getTabId();
      sessionStorage.setItem(`supabase_session_${tabId}`, JSON.stringify(data.session));
    }

    return {
      success: true,
      user: adminUser
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { success: false };
  }
}

// Generate unique tab ID for session isolation
function getTabId(): string {
  if (typeof window !== 'undefined') {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
  }
  return 'default';
}

// Session management for non-admin users with tab isolation
export function setUserSession(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    const tabId = getTabId();
    
    // Store in sessionStorage (tab-specific, not shared across tabs)
    sessionStorage.setItem('userSession', JSON.stringify(user));
    
    // Store tab-specific session in localStorage for potential recovery
    const tabSessions = JSON.parse(localStorage.getItem('tabSessions') || '{}');
    tabSessions[tabId] = {
      user,
      timestamp: Date.now(),
      lastActive: Date.now()
    };
    localStorage.setItem('tabSessions', JSON.stringify(tabSessions));
    
    // Clean up old tab sessions (older than 24 hours)
    cleanupOldSessions();
    
    // Add beforeunload listener to mark tab as closed
    setupTabCleanup();
  }
}

// Setup cleanup when tab/window is closed
function setupTabCleanup(): void {
  if (typeof window !== 'undefined') {
    const handleBeforeUnload = () => {
      const tabId = sessionStorage.getItem('tabId');
      if (tabId) {
        const tabSessions = JSON.parse(localStorage.getItem('tabSessions') || '{}');
        if (tabSessions[tabId]) {
          tabSessions[tabId].closed = true;
          tabSessions[tabId].closedAt = Date.now();
          localStorage.setItem('tabSessions', JSON.stringify(tabSessions));
        }
      }
    };

    // Remove existing listener to avoid duplicates
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);
  }
}

export function getUserSession(): AuthUser | null {
  if (typeof window !== 'undefined') {
    // First try to get from sessionStorage (current tab)
    const sessionData = sessionStorage.getItem('userSession');
    if (sessionData) {
      const user = JSON.parse(sessionData);
      updateLastActive();
      return user;
    }
    
    // If not found in sessionStorage, try to recover from tabSessions
    const tabId = getTabId();
    const tabSessions = JSON.parse(localStorage.getItem('tabSessions') || '{}');
    const tabSession = tabSessions[tabId];
    
    if (tabSession && tabSession.user) {
      // Restore to sessionStorage
      sessionStorage.setItem('userSession', JSON.stringify(tabSession.user));
      updateLastActive();
      return tabSession.user;
    }
  }
  return null;
}

export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    const tabId = getTabId();
    
    // Clear current tab session
    sessionStorage.removeItem('userSession');
    sessionStorage.removeItem('tabId');
    
    // Clear admin-specific session data if it exists
    sessionStorage.removeItem(`supabase_session_${tabId}`);
    
    // Remove from tab sessions
    const tabSessions = JSON.parse(localStorage.getItem('tabSessions') || '{}');
    delete tabSessions[tabId];
    localStorage.setItem('tabSessions', JSON.stringify(tabSessions));
  }
}

// Helper function to update last active timestamp
function updateLastActive(): void {
  if (typeof window !== 'undefined') {
    const tabId = sessionStorage.getItem('tabId');
    if (tabId) {
      const tabSessions = JSON.parse(localStorage.getItem('tabSessions') || '{}');
      if (tabSessions[tabId]) {
        tabSessions[tabId].lastActive = Date.now();
        localStorage.setItem('tabSessions', JSON.stringify(tabSessions));
      }
    }
  }
}

// Helper function to clean up old sessions
function cleanupOldSessions(): void {
  if (typeof window !== 'undefined') {
    const tabSessions = JSON.parse(localStorage.getItem('tabSessions') || '{}');
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    let hasChanges = false;
    Object.keys(tabSessions).forEach(tabId => {
      const session = tabSessions[tabId];
      // Remove sessions that are older than 24 hours OR marked as closed and older than 1 hour
      if (session.lastActive < twentyFourHoursAgo || 
          (session.closed && session.closedAt && session.closedAt < oneHourAgo)) {
        delete tabSessions[tabId];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      localStorage.setItem('tabSessions', JSON.stringify(tabSessions));
    }
  }
}

// Check authentication status with tab isolation
export async function checkAuthStatus(): Promise<AuthUser | null> {
  // Always prioritize local session (tab-specific) first
  const localUser = getUserSession();
  if (localUser) {
    return localUser;
  }

  // Only check global Supabase session if no local session exists AND we're checking for admin
  // This prevents admin sessions from interfering with student/supervisor sessions
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userRole } = await supabase
        .from('academy_roles')
        .select('role')
        .eq('uid', session.user.id)
        .single();

      if (userRole && userRole.role === 'admin') {
        // Check if this tab should have admin access
        const tabId = getTabId();
        const storedAdminSession = sessionStorage.getItem(`supabase_session_${tabId}`);
        
        if (storedAdminSession) {
          return {
            id: parseInt(session.user.id),
            email: session.user.email!,
            role: 'admin'
          };
        }
      }
    }
  } catch (error) {
    console.error('Error checking Supabase session:', error);
  }

  return null;
}

// Helper function to get admin Supabase session for admin-specific operations
export async function getAdminSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  const currentUser = getUserSession();
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const tabId = getTabId();
  const storedAdminSession = sessionStorage.getItem(`supabase_session_${tabId}`);
  
  if (!storedAdminSession) {
    return null;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const tabSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const sessionData = JSON.parse(storedAdminSession);
    await tabSupabase.auth.setSession(sessionData);
    
    return tabSupabase;
  } catch (error) {
    console.error('Error creating admin Supabase client:', error);
    return null;
  }
}

// Logout function with tab isolation
export async function logout(): Promise<void> {
  const currentUser = getUserSession();
  
  // If current user is admin, clear tab-specific Supabase session
  if (currentUser && currentUser.role === 'admin') {
    const tabId = getTabId();
    const storedAdminSession = sessionStorage.getItem(`supabase_session_${tabId}`);
    
    if (storedAdminSession) {
      try {
        // Create a new Supabase client instance for this tab
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const tabSupabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Set the session for this client and then sign out
        const sessionData = JSON.parse(storedAdminSession);
        await tabSupabase.auth.setSession(sessionData);
        await tabSupabase.auth.signOut();
        
        // Remove tab-specific admin session storage
        sessionStorage.removeItem(`supabase_session_${tabId}`);
      } catch (error) {
        console.error('Error during admin logout:', error);
      }
    }
  }
  
  // Always clear local session (tab-specific)
  clearUserSession();
}