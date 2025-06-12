"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession, AuthUser } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import SupervisorSidebar from "@/components/supervisor/supervisor-sidebar";
import SupervisorNavbar from "@/components/supervisor/supervisor-navbar";
import { Users, ClipboardList, BookOpen, TrendingUp, Award } from "lucide-react";

interface SupervisorData {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  department: string;
  role: string;
  join_date: string;
}

interface SupervisorStats {
  totalStudents: number;
  activeStudents: number;
  completedCourses: number;
  pendingTasks: number;
}

interface AssignedStudent {
  id: number;
  name: string;
  course: string;
  register_no: string;
  status: string;
  last_activity: string;
}

export default function SupervisorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisorData, setSupervisorData] = useState<SupervisorData | null>(null);
  const [stats, setStats] = useState<SupervisorStats>({
    totalStudents: 0,
    activeStudents: 0,
    completedCourses: 0,
    pendingTasks: 0
  });
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    checkAuthentication();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthentication = async () => {
    const session = getUserSession();
    
    if (!session || session.role !== 'supervisor') {
      router.push('/signin');
      return;
    }

    setUser(session);
    await fetchSupervisorData(session.id);
    await fetchSupervisorStats(session.id);
    setLoading(false);
  };

  const fetchSupervisorData = async (supervisorId: number) => {
    try {
      const { data, error } = await supabase
        .from('academy_supervisors')
        .select('*')
        .eq('id', supervisorId)
        .single();

      if (error) throw error;
      setSupervisorData(data);
    } catch (error) {
      console.error('Error fetching supervisor data:', error);
    }
  };

  const fetchSupervisorStats = async (supervisorId: number) => {
    try {
      // Fetch assigned students
      const { data: assignedData, error: assignedError } = await supabase
        .from('supervisor_assignment')
        .select(`
          students (
            id,
            name,
            course,
            register_no,
            created_at,
            student_source (
              status
            )
          )
        `)
        .eq('supervisor_id', supervisorId);

      if (assignedError) throw assignedError;      const students = assignedData?.map(item => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentData = item.students as any;
        return {
          id: studentData?.id || 0,
          name: studentData?.name || '',
          course: studentData?.course || '',
          register_no: studentData?.register_no || '',
          status: studentData?.student_source?.[0]?.status || 'new',
          last_activity: studentData?.created_at || new Date().toISOString()
        };
      }) || [];

      setAssignedStudents(students);

      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'confirmed' || s.status === 'follow-up').length;

      setStats({
        totalStudents,
        activeStudents,
        completedCourses: Math.floor(totalStudents * 0.7), // Mock data
        pendingTasks: Math.floor(totalStudents * 0.3) // Mock data
      });
    } catch (error) {
      console.error('Error fetching supervisor stats:', error);
    }
  };

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
      <SupervisorNavbar 
        user={user!} 
        onMenuClick={() => setSidebarOpen(true)} 
        onLogout={handleLogout}
      />
      
      <SupervisorSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user!}
      />

      <div className="lg:ml-64 pt-16">
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Supervisor'}!
            </h1>            <p className="text-gray-600">
              Here&apos;s your supervision overview and student management dashboard.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <ClipboardList className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supervisor Profile */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Supervisor Profile
                </h2>
              </div>
              <div className="p-6">
                {supervisorData && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{supervisorData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{supervisorData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{supervisorData.phone_no}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      <p className="text-gray-900">{supervisorData.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Role</label>
                      <p className="text-gray-900">{supervisorData.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Join Date</label>
                      <p className="text-gray-900">{new Date(supervisorData.join_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Students */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Assigned Students
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {assignedStudents.length > 0 ? (
                    assignedStudents.map((student) => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-600">{student.register_no}</p>
                            <p className="text-sm text-gray-500">{student.course}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            student.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            student.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                            student.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No students assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
