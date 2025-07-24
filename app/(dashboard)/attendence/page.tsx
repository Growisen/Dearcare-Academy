"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from 'react-hot-toast';
import { Eye, ChevronDown, ChevronRight, Users } from 'lucide-react';
import StudentAttendanceInsight from '@/components/attendance/StudentAttendanceInsight';

interface AttendanceRecord {
  student_id: number;
  fn_theory: boolean;
  an_theory: boolean;
  fn_practical: boolean;
  an_practical: boolean;
}

interface StudentWithAttendance {
  student_id: number;
  student_name: string;
  register_no?: string;
  course?: string;
  attendance: SessionAttendance;
}

interface SupervisorWithStudents {
  supervisor_id: number;
  supervisor_name: string;
  students: StudentWithAttendance[];
  expanded: boolean;
}

interface SessionAttendance {
  fn_theory: boolean | null;
  an_theory: boolean | null;
  fn_practical: boolean | null;
  an_practical: boolean | null;
}

export default function AttendancePage() {
  const [supervisors, setSupervisors] = useState<SupervisorWithStudents[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<StudentWithAttendance[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Insight modal state
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const openInsightModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setInsightModalOpen(true);
  };

  const toggleSupervisorExpanded = (supervisorId: number) => {
    setSupervisors(prev => prev.map(supervisor => 
      supervisor.supervisor_id === supervisorId 
        ? { ...supervisor, expanded: !supervisor.expanded }
        : supervisor
    ));
  };

  // Fetch students organized by supervisors and unassigned students
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all supervisors
        const { data: supervisorsData, error: supervisorsError } = await supabase
          .from('academy_supervisors')
          .select('id, name')
          .order('name');

        if (supervisorsError) throw supervisorsError;

        // Fetch assigned students with their supervisors
        const { data: assignedData, error: assignedError } = await supabase
          .from('supervisor_assignment')
          .select(`
            student_id,
            supervisor_id,
            students:students(id, name, register_no, course),
            supervisor:academy_supervisors(id, name)
          `);
          
        if (assignedError) throw assignedError;

        // Fetch all students to find unassigned ones
        const { data: allStudentsData, error: allStudentsError } = await supabase
          .from('students')
          .select('id, name, register_no, course')
          .order('name');

        if (allStudentsError) throw allStudentsError;

        // Fetch attendance for the selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('academy_student_attendance')
          .select('student_id, fn_theory, an_theory, fn_practical, an_practical')
          .eq('date', date);

        if (attendanceError) throw attendanceError;

        // Create attendance map
        const attendanceMap = new Map<number, SessionAttendance>();
        (attendanceData || []).forEach((record: AttendanceRecord) => {
          attendanceMap.set(record.student_id, {
            fn_theory: record.fn_theory,
            an_theory: record.an_theory,
            fn_practical: record.fn_practical,
            an_practical: record.an_practical
          });
        });

        // Organize data by supervisors
        const supervisorMap = new Map<number, SupervisorWithStudents>();
        
        // Initialize supervisors
        (supervisorsData || []).forEach(supervisor => {
          supervisorMap.set(supervisor.id, {
            supervisor_id: supervisor.id,
            supervisor_name: supervisor.name,
            students: [],
            expanded: false
          });
        });

        // Add students to their supervisors
        const assignedStudentIds = new Set<number>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (assignedData || []).forEach((assignment: any) => {
          const student = assignment.students;
          if (student && assignment.supervisor_id) {
            assignedStudentIds.add(student.id);
            const supervisor = supervisorMap.get(assignment.supervisor_id);
            if (supervisor) {
              supervisor.students.push({
                student_id: student.id,
                student_name: student.name,
                register_no: student.register_no,
                course: student.course,
                attendance: attendanceMap.get(student.id) || {
                  fn_theory: null,
                  an_theory: null,
                  fn_practical: null,
                  an_practical: null
                }
              });
            }
          }
        });

        // Find unassigned students
        const unassigned: StudentWithAttendance[] = (allStudentsData || [])
          .filter(student => !assignedStudentIds.has(student.id))
          .map(student => ({
            student_id: student.id,
            student_name: student.name,
            register_no: student.register_no,
            course: student.course,
            attendance: attendanceMap.get(student.id) || {
              fn_theory: null,
              an_theory: null,
              fn_practical: null,
              an_practical: null
            }
          }));

        setSupervisors(Array.from(supervisorMap.values())); // Show all supervisors, even those without students
        setUnassignedStudents(unassigned);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const toggleAttendance = (studentId: number, session: 'fn' | 'an', type: 'theory' | 'practical', isPresent: boolean) => {
    // Update supervisors
    setSupervisors(prev => prev.map(supervisor => ({
      ...supervisor,
      students: supervisor.students.map(student => {
        if (student.student_id === studentId) {
          const currentAttendance = { ...student.attendance };
          const fieldName = `${session}_${type}` as keyof SessionAttendance;
          currentAttendance[fieldName] = isPresent;
          
          // Implement mutual exclusion logic
          if (isPresent) {
            if (session === 'fn') {
              if (type === 'theory') {
                currentAttendance.fn_practical = false;
              } else {
                currentAttendance.fn_theory = false;
              }
            } else {
              if (type === 'theory') {
                currentAttendance.an_practical = false;
              } else {
                currentAttendance.an_theory = false;
              }
            }
          }
          
          return { ...student, attendance: currentAttendance };
        }
        return student;
      })
    })));

    // Update unassigned students
    setUnassignedStudents(prev => prev.map(student => {
      if (student.student_id === studentId) {
        const currentAttendance = { ...student.attendance };
        const fieldName = `${session}_${type}` as keyof SessionAttendance;
        currentAttendance[fieldName] = isPresent;
        
        // Implement mutual exclusion logic
        if (isPresent) {
          if (session === 'fn') {
            if (type === 'theory') {
              currentAttendance.fn_practical = false;
            } else {
              currentAttendance.fn_theory = false;
            }
          } else {
            if (type === 'theory') {
              currentAttendance.an_practical = false;
            } else {
              currentAttendance.an_theory = false;
            }
          }
        }
        
        return { ...student, attendance: currentAttendance };
      }
      return student;
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Collect all students from supervisors and unassigned
      const allStudents = [
        ...supervisors.flatMap(s => s.students),
        ...unassignedStudents
      ];

      // Map attendance state to create attendance entries
      const attendanceEntries = allStudents
        .filter(student => {
          // Only save rows where at least one session has been marked
          const att = student.attendance;
          return att && (
            att.fn_theory !== null ||
            att.an_theory !== null ||
            att.fn_practical !== null ||
            att.an_practical !== null
          );
        })
        .map(student => ({
          student_id: student.student_id,
          date,
          fn_theory: student.attendance?.fn_theory || false,
          an_theory: student.attendance?.an_theory || false,
          fn_practical: student.attendance?.fn_practical || false,
          an_practical: student.attendance?.an_practical || false
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
        toast.success("Attendance saved successfully!");
        
        // Force refresh the entire component data
        window.location.reload();
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
      <h1 className="text-2xl font-bold mb-6">Student Attendance Management</h1>
      
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
      </div>

      {/* Statistics Cards */}
      {!loading && (supervisors.length > 0 || unassignedStudents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold text-blue-600">
                {supervisors.reduce((total, s) => total + s.students.length, 0) + unassignedStudents.length}
              </p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600">Supervisors</h3>
              <p className="text-2xl font-bold text-green-600">{supervisors.length}</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600">Unassigned Students</h3>
              <p className="text-2xl font-bold text-orange-600">{unassignedStudents.length}</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600">Attendance Marked</h3>
              <p className="text-2xl font-bold text-purple-600">
                {(() => {
                  const allStudents = [...supervisors.flatMap(s => s.students), ...unassignedStudents];
                  return allStudents.filter(student => {
                    const att = student.attendance;
                    return att && (
                      att.fn_theory !== null || att.an_theory !== null ||
                      att.fn_practical !== null || att.an_practical !== null
                    );
                  }).length;
                })()}
              </p>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Loading students...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Attendance Management</h2>
            <p className="text-blue-700">Click on each supervisor to expand and view their assigned students. Mark attendance for each student as needed.</p>
          </div>

          {/* Supervisors and their students */}
          {supervisors.map((supervisor) => (
            <Card key={supervisor.supervisor_id} className="p-6">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => toggleSupervisorExpanded(supervisor.supervisor_id)}
              >
                <div className="flex items-center space-x-2">
                  {supervisor.expanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {supervisor.supervisor_name}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {supervisor.students.length} students
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {supervisor.expanded ? 'Click to collapse' : 'Click to expand and mark attendance'}
                </div>
              </div>

              {supervisor.expanded && supervisor.students.length > 0 && (
                <div className="space-y-4">
                  {supervisor.students.map((student, index) => (
                    <StudentAttendanceCard 
                      key={`supervisor-${supervisor.supervisor_id}-student-${student.student_id}-${index}`}
                      student={student}
                      onToggleAttendance={toggleAttendance}
                      onOpenInsights={openInsightModal}
                    />
                  ))}
                </div>
              )}

              {supervisor.expanded && supervisor.students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No students assigned to this supervisor.</p>
                </div>
              )}
            </Card>
          ))}

          {/* Unassigned students */}
          {unassignedStudents.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Unassigned Students</h2>
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {unassignedStudents.length} students
                </span>
              </div>
              
              <div className="space-y-4">
                {unassignedStudents.map((student, index) => (
                  <StudentAttendanceCard 
                    key={`unassigned-${student.student_id}-${index}`}
                    student={student}
                    onToggleAttendance={toggleAttendance}
                    onOpenInsights={openInsightModal}
                  />
                ))}
              </div>
            </Card>
          )}

          {supervisors.length === 0 && unassignedStudents.length === 0 && (
            <p className="text-gray-500 text-center py-8">No students found.</p>
          )}
        </div>
      )}

      <div className="mt-6">
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
            'Save All Attendance'
          )}
        </Button>
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

// Student Attendance Card Component
interface StudentAttendanceCardProps {
  student: StudentWithAttendance;
  onToggleAttendance: (studentId: number, session: 'fn' | 'an', type: 'theory' | 'practical', isPresent: boolean) => void;
  onOpenInsights: (studentId: number) => void;
}

function StudentAttendanceCard({ 
  student, 
  onToggleAttendance, 
  onOpenInsights
}: StudentAttendanceCardProps) {
  const studentAttendance = student.attendance;

  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              {student.student_name}
            </span>
            {student.register_no && (
              <div className="text-sm text-gray-500">Reg: {student.register_no}</div>
            )}
            {student.course && (
              <div className="text-sm text-gray-500">Course: {student.course}</div>
            )}
          </div>
          <Button
            onClick={() => onOpenInsights(student.student_id)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'fn', 'theory', true)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'fn', 'theory', false)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'fn', 'practical', true)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'fn', 'practical', false)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'an', 'theory', true)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'an', 'theory', false)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'an', 'practical', true)}
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
                  onClick={() => onToggleAttendance(student.student_id, 'an', 'practical', false)}
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
}
