"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  id: number;
  date: string;
  present: boolean;
  created_at: string;
}

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  attendancePercentage: number;
}

export default function StudentAttendance() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    attendancePercentage: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchAttendanceData = useCallback(async (studentId: number) => {
    try {
      const { data, error } = await supabase
        .from('academy_student_attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Filter by selected month/year
      const filteredData = data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
      });

      setAttendanceRecords(filteredData);

      // Calculate stats
      const totalClasses = filteredData.length;
      const attendedClasses = filteredData.filter(record => record.present).length;
      const absentClasses = totalClasses - attendedClasses;
      const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      setStats({
        totalClasses,
        attendedClasses,
        absentClasses,
        attendancePercentage
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      fetchAttendanceData(currentUser.id);
    }
    setLoading(false);
  }, [fetchAttendanceData]);

  const getAttendanceStatus = (present: boolean) => {
    return present ? {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
      text: 'Present'
    } : {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      text: 'Absent'
    };
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">{stats.attendedClasses}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">{stats.absentClasses}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className={`text-3xl font-bold ${getAttendanceColor(stats.attendancePercentage)}`}>
                {stats.attendancePercentage.toFixed(1)}%
              </p>
            </div>
            {stats.attendancePercentage >= 75 ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            )}
          </div>
        </div>
      </div>

      {/* Attendance Requirements Alert */}
      {stats.attendancePercentage < 75 && stats.totalClasses > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Attendance Alert</span>
          </div>
          <p className="text-yellow-700 mt-2">
            Your attendance is below the required 75%. Please ensure regular attendance to meet academic requirements.
          </p>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {attendanceRecords.map((record) => {
            const status = getAttendanceStatus(record.present);
            const StatusIcon = status.icon;
            
            return (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.bg}`}>
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Recorded on {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.present 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {status.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {attendanceRecords.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-500">No attendance data found for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
