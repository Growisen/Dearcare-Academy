import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, ShieldCheck } from 'lucide-react';
import { SupervisorDetailsProps, UnassignedStudent, AssignedStudent } from '../../types/supervisors.types';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

type SupervisorType = SupervisorDetailsProps['supervisor'];
const SUPERVISOR_FIELDS: Array<[string, ((s: SupervisorType) => string) | keyof SupervisorType]> = [
  ['Name', 'name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Department', 'department'],
  ['Join Date', 'joinDate'],
  ['Status', (s: SupervisorType) => s.status.replace('_', ' ')]
];

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-gray-50">
      {value}
    </div>
  </div>
);

export function SupervisorDetailsOverlay({ supervisor, onClose }: SupervisorDetailsProps) {
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
  }, [supervisor.id]);

  const fetchUnassignedStudents = async () => {
    setIsLoading(true);
    try {
      // First get all the students that are already assigned to supervisors
      const { data: assignments } = await supabase
        .from('supervisor_assignment')
        .select('student_id');

      const assignedIds = assignments?.map(a => a.student_id) || [];

      // Build the query for unassigned students
      let query = supabase
        .from('students')
        .select(`
          id,
          name,
          email,
          student_source!inner (
            status
          )
        `)
        .filter('student_source.status', 'eq', 'Confirmed');  // Only show confirmed students
      
      // Only add the filter if there are assigned students
      if (assignedIds.length > 0) {
        query = query.filter('id', 'not.in', `(${assignedIds.join(',')})`);
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
      toast.error('Failed to load unassigned students');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    setIsLoadingAssigned(true);
    try {
      const { data, error } = await supabase
        .from('supervisor_assignment')
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
        .eq('supervisor_id', supervisor.id);

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
      if (selectedStudents.length === 0) {
        toast.error('No students selected');
        return;
      }

      // Insert supervisor assignments
      const assignments = selectedStudents.map(studentId => ({
        student_id: parseInt(studentId),
        supervisor_id: parseInt(supervisor.id),
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('supervisor_assignment')
        .insert(assignments);

      if (error) throw error;

      // Refresh both lists
      await Promise.all([
        fetchUnassignedStudents(),
        fetchAssignedStudents()
      ]);
      
      setShowAssignList(false);
      setSelectedStudents([]);
      toast.success(`${selectedStudents.length} student(s) assigned successfully`);

    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error('Failed to assign students');
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
              <h2 className="text-xl font-semibold text-gray-900">Supervisor Details</h2>
              <p className="text-sm text-gray-500">ID: {supervisor.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUPERVISOR_FIELDS.map(([label, key]) => (
                <InfoField 
                  key={label} 
                  label={label} 
                  value={typeof key === 'function' 
                    ? key(supervisor) 
                    : String(supervisor[key])} 
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
