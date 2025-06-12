"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession, AuthUser } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import StudentSidebar from "../../../components/student/student-sidebar";
import StudentNavbar from "../../../components/student/student-navbar";
import { BookOpen, Calendar, FileText, User, Clock, Award } from "lucide-react";

interface StudentData {
  id: number;
  name: string;
  email: string;
  mobile: string;
  course: string;
  register_no: string;
  created_at: string;
}

interface StudentStats {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  upcomingClasses: number;
}

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  subject: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    totalClasses: 0,
    attendedClasses: 0,
    attendancePercentage: 0,
    upcomingClasses: 0
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkAuthentication = useCallback(async () => {
    const session = getUserSession();
    
    if (!session || session.role !== 'student') {
      router.push('/signin');
      return;
    }    setUser(session);
    await fetchStudentData(session.id);
    await fetchStudentStats(session.id);
    setLoading(false);
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudentData = useCallback(async (studentId: number) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setStudentData(data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  }, []);

  const fetchStudentStats = useCallback(async (studentId: number) => {
    try {
      // Fetch attendance data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('academy_student_attendance')
        .select('*')
        .eq('student_id', studentId);

      if (attendanceError) throw attendanceError;

      const totalClasses = attendanceData?.length || 0;
      const attendedClasses = attendanceData?.filter(record => record.present).length || 0;
      const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

      setStats({
        totalClasses,
        attendedClasses,
        attendancePercentage,
        upcomingClasses: 5 // This would come from a schedule table
      });

      // Mock assignments data
      setAssignments([
        {
          id: 1,
          title: "Clinical Procedures Assignment",
          dueDate: "2025-06-20",
          status: "pending",
          subject: "Clinical Practice"
        },
        {
          id: 2,
          title: "Patient Care Report",
          dueDate: "2025-06-18",
          status: "submitted",
          subject: "Patient Care"
        },
        {
          id: 3,
          title: "Medical Terminology Quiz",
          dueDate: "2025-06-15",
          status: "graded",
          subject: "Medical Terms"
        }
      ]);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleLogout = () => {
    clearUserSession();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar 
        user={user!} 
        onMenuClick={() => setSidebarOpen(true)} 
        onLogout={handleLogout}
      />
      
      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user!}
      />

      <div className="lg:ml-64 pt-16">
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-gray-600">
              Here&apos;s your academic progress and upcoming activities.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingClasses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Course</p>
                  <p className="text-lg font-bold text-gray-900">{studentData?.course || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Profile */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </h2>
              </div>
              <div className="p-6">
                {studentData && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{studentData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{studentData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mobile</label>
                      <p className="text-gray-900">{studentData.mobile}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Number</label>
                      <p className="text-gray-900">{studentData.register_no}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Course</label>
                      <p className="text-gray-900">{studentData.course}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Assignments */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Assignments
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">{assignment.subject}</p>
                          <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
