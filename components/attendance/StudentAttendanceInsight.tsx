"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Clock, BookOpen, User, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AttendanceRecord {
  id: number;
  date: string;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
  created_at: string;
}

interface StudentInfo {
  id: number;
  name: string;
  register_no: string;
  course: string;
  email: string;
}

interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  attendancePercentage: number;
}

interface StudentAttendanceInsightProps {
  studentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentAttendanceInsight({ studentId, isOpen, onClose }: StudentAttendanceInsightProps) {
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    attendedSessions: 0,
    absentSessions: 0,
    attendancePercentage: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch student info
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name, register_no, course, email')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudentInfo(student);

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('academy_student_attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Filter by selected month/year
      const filteredData = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
      });

      setAttendanceRecords(filteredData);
      calculateStats(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchData();
    }
  }, [isOpen, studentId, fetchData]);

  const calculateStats = (records: AttendanceRecord[]) => {
    // Calculate total sessions (max 2 per day: FN and AN)
    const totalSessions = records.reduce((total, record) => {
      let sessionCount = 0;
      // Count FN session if either theory or practical is marked
      if (record.fn_theory !== null || record.fn_practical !== null) sessionCount++;
      // Count AN session if either theory or practical is marked
      if (record.an_theory !== null || record.an_practical !== null) sessionCount++;
      return total + sessionCount;
    }, 0);

    // Calculate attended sessions
    const attendedSessions = records.reduce((total, record) => {
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
      attendancePercentage: Math.round(attendancePercentage * 100) / 100
    });
  };

  const getSessionDisplay = (record: AttendanceRecord) => {
    const sessions = [];
    
    // FN Session - show both theory and practical with mutual exclusion
    if (record.fn_theory !== null || record.fn_practical !== null) {
      // FN Theory
      if (record.fn_theory !== null) {
        sessions.push({
          period: 'Forenoon',
          type: 'Theory',
          status: record.fn_theory ? 'Present' : 'Absent',
          color: record.fn_theory ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
          disabled: record.fn_practical === true // Disabled if practical is present
        });
      }
      
      // FN Practical
      if (record.fn_practical !== null) {
        sessions.push({
          period: 'Forenoon',
          type: 'Practical',
          status: record.fn_practical ? 'Present' : 'Absent',
          color: record.fn_practical ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
          disabled: record.fn_theory === true // Disabled if theory is present
        });
      }
    }

    // AN Session - show both theory and practical with mutual exclusion
    if (record.an_theory !== null || record.an_practical !== null) {
      // AN Theory
      if (record.an_theory !== null) {
        sessions.push({
          period: 'Afternoon',
          type: 'Theory',
          status: record.an_theory ? 'Present' : 'Absent',
          color: record.an_theory ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
          disabled: record.an_practical === true // Disabled if practical is present
        });
      }
      
      // AN Practical
      if (record.an_practical !== null) {
        sessions.push({
          period: 'Afternoon',
          type: 'Practical',
          status: record.an_practical ? 'Present' : 'Absent',
          color: record.an_practical ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
          disabled: record.an_theory === true // Disabled if theory is present
        });
      }
    }

    return sessions;
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {studentInfo?.name || 'Loading...'}
              </h2>
              <p className="text-sm text-gray-600">
                {studentInfo?.register_no} • {studentInfo?.course}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading attendance data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter Controls */}
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

              {/* Overall Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalSessions}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Present</p>
                      <p className="text-2xl font-bold text-green-900">{stats.attendedSessions}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Absent</p>
                      <p className="text-2xl font-bold text-red-900">{stats.absentSessions}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Attendance</p>
                      <p className={`text-2xl font-bold ${getAttendanceColor(stats.attendancePercentage)}`}>
                        {stats.attendancePercentage}%
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Attendance Alert */}
              {stats.attendancePercentage < 75 && stats.totalSessions > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">Attendance Alert</span>
                  </div>
                  <p className="text-yellow-700 mt-2">
                    Student&apos;s attendance is below the required 75%. Please ensure regular attendance to meet academic requirements.
                  </p>
                </div>
              )}

              {/* Attendance Records */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {attendanceRecords.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {attendanceRecords.map((record, index) => {
                        const sessions = getSessionDisplay(record);
                        return (
                          <div key={index} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {sessions.map((session, sessionIndex) => (
                                  <div 
                                    key={sessionIndex} 
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${session.color} ${
                                      session.disabled ? 'opacity-50 line-through' : ''
                                    }`}
                                    title={session.disabled ? 'Disabled due to mutual exclusion' : ''}
                                  >
                                    {session.period} {session.type}: {session.status}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No attendance records found for the selected period.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
