"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, AuthUser } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { BookOpen, Calendar, User, Award } from "lucide-react";

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

      // Calculate stats based on correct session structure
      // Each day has max 2 sessions: FN (Forenoon) and AN (Afternoon)
      const totalSessions = attendanceData?.reduce((total, record) => {
        let sessionCount = 0;
        // Count FN session if either theory or practical is marked
        if (record.fn_theory !== null && record.fn_theory !== undefined || 
            record.fn_practical !== null && record.fn_practical !== undefined) sessionCount++;
        // Count AN session if either theory or practical is marked
        if (record.an_theory !== null && record.an_theory !== undefined || 
            record.an_practical !== null && record.an_practical !== undefined) sessionCount++;
        return total + sessionCount;
      }, 0) || 0;
      
      const attendedSessions = attendanceData?.reduce((total, record) => {
        let attendedCount = 0;
        // Count FN session as attended if theory OR practical is true
        if (record.fn_theory === true || record.fn_practical === true) attendedCount++;
        // Count AN session as attended if theory OR practical is true
        if (record.an_theory === true || record.an_practical === true) attendedCount++;
        return total + attendedCount;
      }, 0) || 0;
      
      const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
      
      setStats({
        totalClasses: totalSessions,
        attendedClasses: attendedSessions,
        attendancePercentage,
        upcomingClasses: 5 // This would come from a schedule table
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="space-y-6">
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
              <div className="p-3 rounded-full bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Course</p>
                <p className="text-lg font-bold text-gray-900">{studentData?.course || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold text-gray-900">Active</p>
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

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Activities
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Attendance Marked</p>
                    <p className="text-sm text-gray-500">Today&apos;s class attended</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Course Progress</p>
                    <p className="text-sm text-gray-500">Current module in progress</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upcoming Schedule</p>
                    <p className="text-sm text-gray-500">Next class scheduled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}