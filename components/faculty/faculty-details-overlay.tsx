import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { FacultyDetailsProps, UnassignedStudent, AssignedStudent } from '../../types/faculty.types';
import { supabase } from '../../lib/supabase';

type FacultyType = FacultyDetailsProps['faculty'];
const FACULTY_FIELDS: Array<[string, ((s: FacultyType) => string) | keyof FacultyType]> = [
  ['Name', 'name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Department', 'department'],
  ['Join Date', 'joinDate'],
  ['Status', (s: FacultyType) => s.status.replace('_', ' ')]
];

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-gray-50">
      {value}
    </div>
  </div>
);

export function FacultyDetailsOverlay({ faculty, onClose }: FacultyDetailsProps) {
  const [showAssignList, setShowAssignList] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  /*
  const allStudents = supervisor.faculties.flatMap(f => 
    f.students.map(name => ({ name, subject: f.subject }))
  );
*/
  useEffect(() => {
    if (showAssignList) {
      fetchUnassignedStudents();
    }
  }, [showAssignList]);

  useEffect(() => {
    fetchAssignedStudents();
  }, [faculty.id]);

  const fetchUnassignedStudents = async () => {
    setIsLoading(true);
    try {
      // First get the subquery as a string of IDs
      const { data: assignments } = await supabase
        .from('faculty_assignment')
        .select('student_id');

      const assignedIds = assignments?.map(a => a.student_id) || [];

      // Then get all students who aren't in the assigned list
      const query = supabase
        .from('students')
        .select(`
          id,
          name,
          email,
          student_source!left (
            status
          )
        `)
        .filter('id', 'not.in', `(${assignedIds.join(',')})`);
      
      if (!assignedIds.length) {
        query.limit(100); // Apply limit only when there are no assigned IDs
      }

      const { data, error } = await query;

      if (error) throw error;

      setUnassignedStudents((data || []).map(student => ({
        id: student.id,
        name: student.name || 'Unnamed Student',
        email: student.email || '',
        course: student.student_source?.[0]?.status || 'Not specified'
      })));

    } catch (error) {
      console.error('Error fetching unassigned students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    setIsLoadingAssigned(true);
    try {
      const { data, error } = await supabase
        .from('faculty_assignment')
        .select(`
          student_id,
          students (
            id,
            name,
            email,
            student_source (
              status
            )
          )
        `)
        .eq('faculty_id', faculty.id);

      if (error) throw error;

      const students = data?.map(item => item.students).flat() || [];
      setAssignedStudents(students);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
    } finally {
      setIsLoadingAssigned(false);
    }
  };

  const handleAssignStudents = async () => {
    try {
      // Insert supervisor assignments
      const assignments = selectedStudents.map(studentId => ({
        student_id: parseInt(studentId),
        faculty_id: parseInt(faculty.id),
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('faculty_assignment')
        .insert(assignments)
        .select();

      if (error) throw error;

      // Refresh both lists
      await Promise.all([
        fetchUnassignedStudents(),
        fetchAssignedStudents()
      ]);
      
      setShowAssignList(false);
      setSelectedStudents([]);

    } catch (error) {
      console.error('Error assigning students:', error);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      {showAssignList ? (
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Students</h2>
              <p className="text-sm text-gray-500">{selectedStudents.length} students selected</p>
            </div>
            <button onClick={() => setShowAssignList(false)} className="p-2 hover:bg-gray-50 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-4">Loading students...</div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {unassignedStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id.toString())}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors
                      ${selectedStudents.includes(student.id.toString())
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                      }`}
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                      <p className="text-xs text-gray-500">{student.email || 'No email'}</p>
                      {student.course && (
                        <p className="text-xs text-gray-400">{student.course}</p>
                      )}
                    </div>
                    {selectedStudents.includes(student.id.toString()) && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                ))}
                {unassignedStudents.length === 0 && !isLoading && (
                  <div className="text-center py-4 text-gray-500">
                    No unassigned students found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
            <button
              onClick={handleAssignStudents}
              disabled={selectedStudents.length === 0}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Assign Selected Students
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Faculty Details</h2>
              <p className="text-sm text-gray-500">ID: {faculty.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FACULTY_FIELDS.map(([label, key]) => (
                <InfoField 
                  key={label} 
                  label={label} 
                  value={typeof key === 'function' 
                    ? key(faculty) 
                    : String(faculty[key])} 
                />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Students</h3>
                  <p className="text-sm text-gray-500">Total {assignedStudents.length} students</p>
                </div>
                <button 
                  onClick={() => setShowAssignList(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <UserPlus className="h-4 w-4" />Assign Student
                </button>
              </div>

              <div className="grid gap-2 max-h-[40vh] overflow-y-auto pr-2">
                {isLoadingAssigned ? (
                  <div className="text-center py-4">Loading assigned students...</div>
                ) : assignedStudents.length > 0 ? (
                  assignedStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        {student.student_source?.[0]?.status || 'Active'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No students assigned yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
