"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { TrendingUp, Users, Calendar, Award, Download, BarChart3 } from "lucide-react";

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  averageAttendance: number;
  completedEvaluations: number;
  monthlyProgress: { month: string; count: number }[];
}

export default function SupervisorReports() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      fetchReportData(currentUser.id);
    }
    setLoading(false);
  }, [selectedPeriod]);

  const fetchReportData = async (supervisorId: number) => {
    try {
      // Fetch assigned students count
      const { data: assignments, error: assignmentError } = await supabase
        .from('supervisor_assignment')
        .select('student_id')
        .eq('supervisor_id', supervisorId);

      if (assignmentError) throw assignmentError;

      const studentIds = assignments.map(a => a.student_id);

      // Fetch attendance data
      let averageAttendance = 0;
      if (studentIds.length > 0) {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('academy_student_attendance')
          .select('present, student_id')
          .in('student_id', studentIds);

        if (!attendanceError && attendanceData) {
          const totalRecords = attendanceData.length;
          const presentRecords = attendanceData.filter(record => record.present).length;
          averageAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
        }
      }

      // Mock data for demonstration
      const mockData: ReportData = {
        totalStudents: studentIds.length,
        activeStudents: Math.floor(studentIds.length * 0.85),
        averageAttendance: Math.round(averageAttendance),
        completedEvaluations: Math.floor(studentIds.length * 0.6),
        monthlyProgress: [
          { month: 'Jan', count: 5 },
          { month: 'Feb', count: 8 },
          { month: 'Mar', count: 12 },
          { month: 'Apr', count: 15 },
          { month: 'May', count: 18 },
          { month: 'Jun', count: studentIds.length },
        ]
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const exportReport = () => {
    // Mock export functionality
    alert('Report export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm font-medium">↗ +2 from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.activeStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm font-medium">
              {((reportData.activeStudents / reportData.totalStudents) * 100).toFixed(1)}% activity rate
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.averageAttendance}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${reportData.averageAttendance >= 75 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.averageAttendance >= 75 ? 'Good' : 'Needs attention'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Evaluations</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.completedEvaluations}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-500 text-sm font-medium">
              {((reportData.completedEvaluations / reportData.totalStudents) * 100).toFixed(1)}% completion rate
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Student Progress Over Time</h2>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Monthly View</span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4 h-64">
          {reportData.monthlyProgress.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-end space-y-2">
              <div 
                className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                style={{ 
                  height: `${(item.count / Math.max(...reportData.monthlyProgress.map(d => d.count))) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="text-xs text-gray-600">{item.month}</span>
              <span className="text-xs font-medium text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Completed evaluation for John Doe</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Reviewed attendance report</span>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Updated student progress notes</span>
            <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
