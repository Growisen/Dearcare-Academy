"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { Calendar, Users, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import StudentAttendanceInsight from '@/components/attendance/StudentAttendanceInsight';

interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  date: string;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
  notes?: string;
}

interface Student {
  id: number;
  name: string;
  register_no: string;
  course: string;
}

interface AttendanceData {
  id: number;
  student_id: number;
  date: string;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
  notes?: string;
  students: {
    name: string;
  };
}

export default function SupervisorAttendance() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Insight modal state
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const openInsightModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setInsightModalOpen(true);
  };

  useEffect(() => {
    const initializeData = async () => {
      const currentUser = getUserSession();
      if (currentUser) {
        await fetchStudents(currentUser.id);
        await fetchAttendance();
      } else {
        setError('User session not found. Please sign in again.');
        setLoading(false);
      }
    };
    
    initializeData();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudents = async (supervisorId: number) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('supervisor_assignment')
        .select(`
          students!supervisor_assignment_student_id_fkey (
            id,
            name,
            register_no,
            course
          )
        `)
        .eq('supervisor_id', supervisorId);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentList = data?.map((item: any) => {
        const student = item.students;
        return {
          id: student?.id || 0,
          name: student?.name || '',
          register_no: student?.register_no || '',
          course: student?.course || ''
        };
      }).filter((student: Student) => student.id > 0) || []; // Filter out invalid students

      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
    }
  };

  const fetchAttendance = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('academy_student_attendance')
        .select(`
          *,
          students!academy_student_attendance_student_id_fkey (
            name
          )
        `)
        .eq('date', selectedDate);

      if (error) throw error;

      const records = data?.map((record: AttendanceData) => ({
        id: record.id,
        student_id: record.student_id,
        student_name: record.students.name,
        date: record.date,
        fn_theory: record.fn_theory,
        an_theory: record.an_theory,
        fn_practical: record.fn_practical,
        an_practical: record.an_practical,
        notes: record.notes
      })) || [];

      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to load attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: number, session: 'fn' | 'an', type: 'theory' | 'practical', isPresent: boolean) => {
    try {
      setSaving(true);
      setError(null);
      
      const currentUser = getUserSession();
      if (!currentUser) {
        setError('User session not found. Please sign in again.');
        return;
      }

      const response = await fetch('/api/supervisor-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisorId: currentUser.id,
          studentId,
          date: selectedDate,
          session,
          type,
          isPresent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save attendance');
      }

      // Refresh attendance data
      await fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStatus = (studentId: number, session: 'fn' | 'an', type: 'theory' | 'practical') => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    if (!record) return null;
    
    const fieldName = `${session}_${type}` as keyof AttendanceRecord;
    return record[fieldName] as boolean;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading attendance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {saving && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Saving...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Sessions Attended</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceRecords.reduce((count, r) => {
                  let sessionsAttended = 0;
                  // Count FN session as attended if theory OR practical is true
                  if (r.fn_theory === true || r.fn_practical === true) sessionsAttended++;
                  // Count AN session as attended if theory OR practical is true
                  if (r.an_theory === true || r.an_practical === true) sessionsAttended++;
                  return count + sessionsAttended;
                }, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Students with Records</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceRecords.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-500">Not Marked</p>
              <p className="text-xl font-bold text-gray-900">
                {students.length - attendanceRecords.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {students.map((student, index) => {
            const fnTheoryStatus = getAttendanceStatus(student.id, 'fn', 'theory');
            const anTheoryStatus = getAttendanceStatus(student.id, 'an', 'theory');
            const fnPracticalStatus = getAttendanceStatus(student.id, 'fn', 'practical');
            const anPracticalStatus = getAttendanceStatus(student.id, 'an', 'practical');
            
            return (
              <div key={`attendance-${student.id}-${index}-${student.register_no || student.name || 'unknown'}`} className="p-6 hover:bg-gray-50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.register_no} • {student.course}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openInsightModal(student.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Student Attendance Insights"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Forenoon Sessions */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Forenoon (FN)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* FN Theory */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Theory</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markAttendance(student.id, 'fn', 'theory', true)}
                            disabled={fnPracticalStatus === true}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              fnTheoryStatus === true
                                ? 'bg-green-600 text-white'
                                : fnPracticalStatus === true
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'fn', 'theory', false)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              fnTheoryStatus === false
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                      
                      {/* FN Practical */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Practical</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markAttendance(student.id, 'fn', 'practical', true)}
                            disabled={fnTheoryStatus === true}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              fnPracticalStatus === true
                                ? 'bg-green-600 text-white'
                                : fnTheoryStatus === true
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'fn', 'practical', false)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              fnPracticalStatus === false
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Afternoon Sessions */}
                  <div className="border rounded-lg p-4 bg-orange-50">
                    <h4 className="text-sm font-semibold text-orange-900 mb-3">Afternoon (AN)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* AN Theory */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Theory</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markAttendance(student.id, 'an', 'theory', true)}
                            disabled={anPracticalStatus === true}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              anTheoryStatus === true
                                ? 'bg-green-600 text-white'
                                : anPracticalStatus === true
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'an', 'theory', false)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              anTheoryStatus === false
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                      
                      {/* AN Practical */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Practical</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markAttendance(student.id, 'an', 'practical', true)}
                            disabled={anTheoryStatus === true}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              anPracticalStatus === true
                                ? 'bg-green-600 text-white'
                                : anTheoryStatus === true
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'an', 'practical', false)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              anPracticalStatus === false
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-500">You don&apos;t have any students assigned to you.</p>
          </div>
        )}
      </div>
      
      {/* Student Attendance Insight Modal */}
      {selectedStudentId && (
        <StudentAttendanceInsight
          studentId={selectedStudentId}
          isOpen={insightModalOpen}
          onClose={() => {
            setInsightModalOpen(false);
            setSelectedStudentId(null);
          }}
        />
      )}
    </div>
  );
}