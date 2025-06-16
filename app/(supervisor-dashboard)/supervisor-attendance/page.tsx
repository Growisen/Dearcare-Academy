"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  date: string;
  present: boolean;
  notes?: string;
}

interface Student {
  id: number;
  name: string;
  register_no: string;
  course: string;
}

interface SupervisorStudentAssignment {
  students: {
    id: number;
    name: string;
    register_no: string;
    course: string;
  }[];
}

interface AttendanceData {
  id: number;
  student_id: number;
  date: string;
  present: boolean;
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

  useEffect(() => {
    const currentUser = getUserSession();    if (currentUser) {
      fetchStudents(currentUser.id);
      fetchAttendance();
    }
    setLoading(false);
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudents = async (supervisorId: number) => {
    try {
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
        .eq('supervisor_id', supervisorId);      if (error) throw error;

      const studentList = data?.map((item: SupervisorStudentAssignment) => ({
        id: item.students[0]?.id || 0,
        name: item.students[0]?.name || '',
        register_no: item.students[0]?.register_no || '',
        course: item.students[0]?.course || ''
      })) || [];

      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_student_attendance')
        .select(`
          *,
          students!academy_student_attendance_student_id_fkey (
            name
          )
        `)
        .eq('date', selectedDate);      if (error) throw error;

      const records = data?.map((record: AttendanceData) => ({
        id: record.id,
        student_id: record.student_id,
        student_name: record.students.name,
        date: record.date,
        present: record.present,
        notes: record.notes
      })) || [];

      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (studentId: number, present: boolean) => {
    try {
      const existingRecord = attendanceRecords.find(r => r.student_id === studentId);

      if (existingRecord) {
        const { error } = await supabase
          .from('academy_student_attendance')
          .update({ present })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('academy_student_attendance')
          .insert({
            student_id: studentId,
            date: selectedDate,
            present
          });

        if (error) throw error;
      }      // Refresh attendance data
      const currentUser = getUserSession();
      if (currentUser) {
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getAttendanceStatus = (studentId: number) => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    return record ? record.present : null;
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
        <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

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
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceRecords.filter(r => r.present).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceRecords.filter(r => !r.present).length}
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
          {students.map((student) => {
            const status = getAttendanceStatus(student.id);
            return (
              <div key={student.id} className="p-6 hover:bg-gray-50">
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
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => markAttendance(student.id, true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        status === true
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        status === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      Absent
                    </button>
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
    </div>
  );
}