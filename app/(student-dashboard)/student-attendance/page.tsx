"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  id: number;
  date: string;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
  created_at: string;
}

interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  attendancePercentage: number;
}

export default function StudentAttendance() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    attendedSessions: 0,
    absentSessions: 0,
    attendancePercentage: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceData = useCallback(async (studentId: number) => {
    try {
      setError(null);
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

      // Calculate stats based on correct session structure
      // Each day has max 2 sessions: FN (Forenoon) and AN (Afternoon)
      const totalSessions = filteredData.reduce((total, record) => {
        let sessionCount = 0;
        // Count FN session if either theory or practical is marked
        if (record.fn_theory !== null && record.fn_theory !== undefined || 
            record.fn_practical !== null && record.fn_practical !== undefined) sessionCount++;
        // Count AN session if either theory or practical is marked  
        if (record.an_theory !== null && record.an_theory !== undefined || 
            record.an_practical !== null && record.an_practical !== undefined) sessionCount++;
        return total + sessionCount;
      }, 0);
      
      const attendedSessions = filteredData.reduce((total, record) => {
        let attendedCount = 0;
        // Count FN session as attended if theory OR practical is true
        if (record.fn_theory === true || record.fn_practical === true) attendedCount++;
        // Count AN session as attended if theory OR practical is true
        if (record.an_theory === true || record.an_practical === true) attendedCount++;
        return total + attendedCount;
      }, 0);
      
      const absentSessions = totalSessions - attendedSessions;
      const attendancePercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

      setStats({
        totalSessions,
        attendedSessions,
        absentSessions,
        attendancePercentage
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data. Please try again.');
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const initializeData = async () => {
      const currentUser = getUserSession();
      if (currentUser) {
        await fetchAttendanceData(currentUser.id);
      } else {
        setError('User session not found. Please sign in again.');
      }
      setLoading(false);
    };
    
    initializeData();
  }, [fetchAttendanceData]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading attendance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
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
              <option key={`month-${i}`} value={i}>
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
              <option key={`year-${new Date().getFullYear() - i}`} value={new Date().getFullYear() - i}>
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
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">{stats.attendedSessions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">{stats.absentSessions}</p>
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
      {stats.attendancePercentage < 75 && stats.totalSessions > 0 && (
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
          {attendanceRecords.map((record, index) => {
            const sessions = [
              { session: 'Forenoon Theory', attended: record.fn_theory },
              { session: 'Forenoon Practical', attended: record.fn_practical },
              { session: 'Afternoon Theory', attended: record.an_theory },
              { session: 'Afternoon Practical', attended: record.an_practical }
            ].filter(s => s.attended !== null && s.attended !== undefined);
            
            return (
              <div key={`attendance-record-${record.id}-${index}-${record.date}`} className="px-6 py-4 hover:bg-gray-50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
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
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        {sessions.filter(s => s.attended).length} / {sessions.length} sessions attended
                      </span>
                    </div>
                  </div>
                  
                  {/* Sessions Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {sessions.map((sessionInfo, sessionIndex) => (
                      <div key={`session-${sessionIndex}`} className={`p-2 rounded-lg text-center text-xs ${
                        sessionInfo.attended 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className="font-medium">{sessionInfo.session}</div>
                        <div className="text-xs mt-1">{sessionInfo.attended ? 'Present' : 'Absent'}</div>
                      </div>
                    ))}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-2">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
