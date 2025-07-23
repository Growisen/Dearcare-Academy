"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from 'react-hot-toast';
import { Eye } from 'lucide-react';
import StudentAttendanceInsight from '@/components/attendance/StudentAttendanceInsight';

// interface Student {
//   id: number;
//   name: string;
//   register_no?: string;
// }

// interface StudentSource {
//   student_id: number;
//   students: {
//     id: number;
//     name: string;
//     register_no?: string;
//   } | null; // Ensure students can be null
// }

interface AttendanceRecord {
  student_id: number;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
}

// interface SupervisorAssignment {
//   student_id: number;
//   supervisor_id: number;
//   students: {
//     id: number;
//     name: string;
//     register_no?: string;
//   } | null;
//   academy_supervisor: {
//     id: number;
//     name: string;
//   } | null;
// }

interface StudentWithSupervisor {
  student_id: number;
  student_name: string;
  supervisor_id: number;
  supervisor_name: string;
  register_no?: string;
}

interface SessionAttendance {
  fn_theory: boolean | null;
  an_theory: boolean | null;
  fn_practical: boolean | null;
  an_practical: boolean | null;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<{ [key: number]: SessionAttendance }>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentWithSupervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(false); // Track save status
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Insight modal state
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const openInsightModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setInsightModalOpen(true);
  };

  // Fetch students dynamically from the "students" and "student_source" tables
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch supervisor assignments with student and supervisor names
        const { data, error } = await supabase
          .from('supervisor_assignment')
          .select(`
            student_id,
            supervisor_id,
            students:students(id, name, register_no),
            supervisor:academy_supervisors(id, name)
          `);
          
        if (error) {
          console.error('Error fetching supervisor assignments:', error);
          throw error;
        } else if (data) {
          // Map to StudentWithSupervisor structure, filter out nulls
          type SupabaseEntry = {
            students: unknown;
            supervisor: unknown;
          } & Record<string, unknown>;
          
          function getFirstObj<T>(field: unknown): T | null {
            if (Array.isArray(field) && field.length > 0) {
              return field[0] as T;
            }
            return field as T | null;
          }
          
          const mapped: StudentWithSupervisor[] = (data as SupabaseEntry[])
            .map((entry) => {
              const studentObj = getFirstObj<{ id: number; name: string; register_no?: string }>(entry.students);
              const supervisorObj = getFirstObj<{ id: number; name: string }>(entry.supervisor);
              if (!studentObj || !supervisorObj) return null;
              return {
                student_id: studentObj.id,
                student_name: studentObj.name,
                register_no: studentObj.register_no,
                supervisor_id: supervisorObj.id,
                supervisor_name: supervisorObj.name,
              };
            })
            .filter(Boolean) as StudentWithSupervisor[];
            
          setStudents(mapped);
          
          // Initialize attendance state for all students
          const initialAttendance: { [key: number]: SessionAttendance } = {};
          mapped.forEach((student) => {
            initialAttendance[student.student_id] = {
              fn_theory: null,
              an_theory: null,
              fn_practical: null,
              an_practical: null
            };
          });
          setAttendance(initialAttendance);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch saved attendance for the selected date
  useEffect(() => {
    const fetchSavedAttendance = async () => {
      const { data, error } = await supabase
        .from("academy_student_attendance")
        .select("student_id, fn_theory, an_theory, fn_practical, an_practical")
        .eq("date", date);

      if (error) {
        console.error("Error fetching saved attendance:", error);
      } else if (data && data.length > 0) {
        const savedAttendance = (data as AttendanceRecord[]).reduce(
          (acc, record) => ({
            ...acc,
            [record.student_id]: {
              fn_theory: record.fn_theory,
              an_theory: record.an_theory,
              fn_practical: record.fn_practical,
              an_practical: record.an_practical
            },
          }),
          {}
        );
        setAttendance(savedAttendance); // Update attendance state with saved data
        setSaveStatus(true); // Mark save status as true since attendance exists
      } else {
        // Reset attendance state if no saved data exists
        const initialAttendance: { [key: number]: SessionAttendance } = {};
        students.forEach((student) => {
          initialAttendance[student.student_id] = {
            fn_theory: null,
            an_theory: null,
            fn_practical: null,
            an_practical: null
          };
        });
        setAttendance(initialAttendance);
        setSaveStatus(false); // Mark save status as false
      }
    };

    fetchSavedAttendance();
  }, [date, students]);

  const toggleAttendance = (studentId: number, session: 'fn' | 'an', type: 'theory' | 'practical', isPresent: boolean) => {
    setAttendance((prev) => {
      const currentAttendance = prev[studentId] || {
        fn_theory: null,
        an_theory: null,
        fn_practical: null,
        an_practical: null
      };
      
      const fieldName = `${session}_${type}` as keyof SessionAttendance;
      const updatedAttendance = { ...currentAttendance };
      updatedAttendance[fieldName] = isPresent;
      
      // Implement mutual exclusion logic
      if (isPresent) {
        if (session === 'fn') {
          if (type === 'theory') {
            updatedAttendance.fn_practical = false;
          } else {
            updatedAttendance.fn_theory = false;
          }
        } else {
          if (type === 'theory') {
            updatedAttendance.an_practical = false;
          } else {
            updatedAttendance.an_theory = false;
          }
        }
      }
      
      return {
        ...prev,
        [studentId]: updatedAttendance,
      };
    });
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Map attendance state to create attendance entries
      const attendanceEntries = Object.entries(attendance)
        .filter(([, sessionAttendance]) => {
          // Only save rows where at least one session has been marked
          return sessionAttendance && (
            sessionAttendance.fn_theory !== null ||
            sessionAttendance.an_theory !== null ||
            sessionAttendance.fn_practical !== null ||
            sessionAttendance.an_practical !== null
          );
        })
        .map(([studentId, sessionAttendance]) => ({
          student_id: parseInt(studentId, 10),
          date,
          fn_theory: sessionAttendance?.fn_theory || false,
          an_theory: sessionAttendance?.an_theory || false,
          fn_practical: sessionAttendance?.fn_practical || false,
          an_practical: sessionAttendance?.an_practical || false
        }));

      // If no attendance data is available, show a toast
      if (attendanceEntries.length === 0) {
        toast.error("No attendance data to save.");
        return;
      }

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from("academy_student_attendance")
        .upsert(attendanceEntries, {
          onConflict: 'student_id,date',
          ignoreDuplicates: false
        });

      // Handle errors or success
      if (error) {
        console.error("Error saving attendance:", error);
        setError("Failed to save attendance. Please try again.");
        toast.error("Failed to save attendance. Please try again.");
      } else {
        setSaveStatus(true); // Update save status to true
        toast.success("Attendance saved successfully!");
      }
    } catch (error) {
      console.error("Unexpected error saving attendance:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Attendance</h1>
      
      <div className="mb-6 flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </div>
        {saveStatus && (
          <p className="text-green-600 font-medium">Attendance saved successfully!</p>
        )}
        {saving && (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Saving...
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">FN Sessions Marked</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(attendance).filter(a => a && (a.fn_theory !== null || a.fn_practical !== null)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AN Sessions Marked</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Object.values(attendance).filter(a => a && (a.an_theory !== null || a.an_practical !== null)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sessions Attended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(attendance).reduce((total, a) => {
                    if (!a) return total;
                    let sessionsAttended = 0;
                    // Count FN session as attended if theory OR practical is true
                    if (a.fn_theory === true || a.fn_practical === true) sessionsAttended++;
                    // Count AN session as attended if theory OR practical is true
                    if (a.an_theory === true || a.an_practical === true) sessionsAttended++;
                    return total + sessionsAttended;
                  }, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-600 font-medium">{error}</div>
            <button 
              onClick={() => setError(null)} 
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading students...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {students.length > 0 ? (
            students.map((student, index) => {
              const studentAttendance = attendance[student.student_id] || {
                fn_theory: null,
                an_theory: null,
                fn_practical: null,
                an_practical: null
              };
              
              return (
                <Card
                  key={`attendance-${student.student_id}-${index}`}
                  className="p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-semibold">
                          Supervisor ({student.supervisor_name}) → Student ({student.student_name})
                        </span>
                        {student.register_no && (
                          <div className="text-sm text-gray-500">({student.register_no})</div>
                        )}
                      </div>
                      <Button
                        onClick={() => openInsightModal(student.student_id)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Insights</span>
                      </Button>
                    </div>
                    
                    {/* Forenoon Sessions */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">Forenoon (FN)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* FN Theory */}
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Theory</p>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'fn', 'theory', true)}
                              disabled={studentAttendance.fn_practical === true}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.fn_theory === true
                                  ? 'bg-green-600 text-white'
                                  : studentAttendance.fn_practical === true
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                              }`}
                            >
                              Present
                            </Button>
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'fn', 'theory', false)}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.fn_theory === false
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                              }`}
                            >
                              Absent
                            </Button>
                          </div>
                        </div>
                        
                        {/* FN Practical */}
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Practical</p>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'fn', 'practical', true)}
                              disabled={studentAttendance.fn_theory === true}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.fn_practical === true
                                  ? 'bg-green-600 text-white'
                                  : studentAttendance.fn_theory === true
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                              }`}
                            >
                              Present
                            </Button>
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'fn', 'practical', false)}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.fn_practical === false
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                              }`}
                            >
                              Absent
                            </Button>
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
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'an', 'theory', true)}
                              disabled={studentAttendance.an_practical === true}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.an_theory === true
                                  ? 'bg-green-600 text-white'
                                  : studentAttendance.an_practical === true
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                              }`}
                            >
                              Present
                            </Button>
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'an', 'theory', false)}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.an_theory === false
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                              }`}
                            >
                              Absent
                            </Button>
                          </div>
                        </div>
                        
                        {/* AN Practical */}
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Practical</p>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'an', 'practical', true)}
                              disabled={studentAttendance.an_theory === true}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.an_practical === true
                                  ? 'bg-green-600 text-white'
                                  : studentAttendance.an_theory === true
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                              }`}
                            >
                              Present
                            </Button>
                            <Button
                              onClick={() => toggleAttendance(student.student_id, 'an', 'practical', false)}
                              className={`px-3 py-1 text-xs ${
                                studentAttendance.an_practical === false
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                              }`}
                            >
                              Absent
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-gray-500">No students assigned to supervisors found.</p>
          )}
        </div>
      )}
      <div className="mt-6">
        {!saveStatus && (
          <Button
            onClick={saveAttendance}
            disabled={saving}
            className={`px-6 py-2 rounded-md transition-colors ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Attendance'
            )}
          </Button>
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
