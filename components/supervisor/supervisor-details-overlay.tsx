import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, UserMinus, UserCheck, Edit, Save } from 'lucide-react';
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

const InfoField = ({ 
  label, 
  value, 
  isEditing = false, 
  onChange, 
  type = 'text' 
}: { 
  label: string; 
  value: React.ReactNode;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea';
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {isEditing && onChange ? (
      type === 'textarea' ? (
        <textarea
          className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          type={type}
          className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    ) : (
      <div className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-gray-50">
        {value}
      </div>
    )}
  </div>
);

export function SupervisorDetailsOverlay({ supervisor, onClose }: SupervisorDetailsProps) {
  const [showAssignList, setShowAssignList] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  const [isLoadingFacultyStatus, setIsLoadingFacultyStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [facultyData, setFacultyData] = useState<{
    register_no: string;
    name: string;
    join_date: string;
    department: string;
    email: string;
    phone_no: string;
    role: string;
    dob: string;
    martialstatus: string;
    address: string;
    gender: string;
  } | null>(null);
  const [originalData, setOriginalData] = useState<typeof facultyData>(null);
  /*
  const allStudents = supervisor.faculties.flatMap(f => 
    f.students.map(name => ({ name, subject: f.subject }))
  );
*/  useEffect(() => {
    if (showAssignList) {
      fetchUnassignedStudents();
    }
  }, [showAssignList]);

  useEffect(() => {
    fetchAssignedStudents();
    fetchFacultyData();
  }, [supervisor.id]);

  const fetchUnassignedStudents = async () => {
    setIsLoading(true);
    try {
      // First get the subquery as a string of IDs
      const { data: assignments } = await supabase
        .from('supervisor_assignment')
        .select('student_id');      const assignedIds = assignments?.map(a => a.student_id) || [];

      // Then get all confirmed students who aren't in the assigned list
      const query = supabase
        .from('students')
        .select(`
          id,
          name,
          email,
          register_no,
          student_source!student_source_student_id_fkey!inner (
            status
          )
        `)
        .filter('id', 'not.in', `(${assignedIds.join(',')})`)
        .filter('student_source.status', 'eq', 'Confirmed');
      
      if (!assignedIds.length) {
        query.limit(100);
      }

      const { data, error } = await query;

      if (error) throw error;      setUnassignedStudents((data || []).map(student => ({
        id: student.id,
        name: student.name || 'Unnamed Student',
        email: student.email || '',
        register_no: student.register_no || '',
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
    try {      const { data, error } = await supabase
        .from('supervisor_assignment')
        .select(`
          student_id,
          students (
            id,
            name,
            email,
            register_no,
            student_source!student_source_student_id_fkey (
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
      // Insert supervisor assignments
      const assignments = selectedStudents.map(studentId => ({
        student_id: parseInt(studentId),
        supervisor_id: parseInt(supervisor.id),
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('supervisor_assignment')
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
  const handleRemoveStudent = async (studentId: number) => {
    try {
      // Remove the assignment from supervisor_assignment table
      const { error } = await supabase
        .from('supervisor_assignment')
        .delete()
        .match({
          student_id: studentId,
          supervisor_id: parseInt(supervisor.id)
        });

      if (error) throw error;

      // Refresh assigned students list
      await fetchAssignedStudents();
      
      // Also refresh unassigned students if the assign list is open
      if (showAssignList) {
        await fetchUnassignedStudents();
      }

    } catch (error) {
      console.error('Error removing student assignment:', error);
    }
  };
  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const fetchFacultyData = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_faculties')
        .select('*')
        .eq('id', supervisor.id)
        .single();      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching faculty data:', error);
      } else if (data) {
        setFacultyData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    }
  };

  const handleSetAsFaculty = async () => {
    if (!facultyData) return;

    setIsLoadingFacultyStatus(true);
    try {
      // Check if supervisor has assigned students before removing
      const { data: assignedStudentsCheck, error: checkError } = await supabase
        .from('supervisor_assignment')
        .select('student_id')
        .eq('supervisor_id', supervisor.id);

      if (checkError) {
        console.error('Error checking assigned students:', checkError);
        toast.error('Failed to check supervisor status. Please try again.');
        return;
      }

      if (assignedStudentsCheck && assignedStudentsCheck.length > 0) {
        // Supervisor has assigned students, show clean error message
        toast.error(
          `Cannot set supervisor back to faculty. This supervisor currently has ${assignedStudentsCheck.length} assigned student${assignedStudentsCheck.length > 1 ? 's' : ''}. Please remove all assigned students first.`,
          {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: '#fff',
              fontSize: '14px',
              maxWidth: '500px',
            },
            icon: '⚠️',
          }
        );
        return;
      }

      // Remove from supervisors table (no assigned students)
      const { error } = await supabase
        .from('academy_supervisors')
        .delete()
        .eq('id', supervisor.id);

      if (error) {
        console.error('Error removing supervisor:', error);
        toast.error('Failed to set as faculty. Please try again.');
      } else {
        toast.success('Successfully set as faculty!');
        onClose(); // Close the modal since the supervisor no longer exists
      }
    } catch (error) {
      console.error('Error setting as faculty:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoadingFacultyStatus(false);
    }
  };

  const handleSave = async () => {
    if (!facultyData) return;
    
    setIsSaving(true);
    try {
      // Update supervisor data in the database
      const { error: supervisorError } = await supabase
        .from('academy_supervisors')
        .update({
          name: facultyData.name,
          join_date: facultyData.join_date,
          department: facultyData.department,
          email: facultyData.email,
          phone_no: facultyData.phone_no,
          role: facultyData.role,
          dob: facultyData.dob,
          martialstatus: facultyData.martialstatus,
          address: facultyData.address,
          gender: facultyData.gender
        })
        .eq('id', supervisor.id);

      if (supervisorError) throw supervisorError;

      // Also update in faculty table if exists
      const { error: facultyError } = await supabase
        .from('academy_faculties')
        .update({
          name: facultyData.name,
          join_date: facultyData.join_date,
          department: facultyData.department,
          email: facultyData.email,
          phone_no: facultyData.phone_no,
          role: facultyData.role,
          dob: facultyData.dob,
          martialstatus: facultyData.martialstatus,
          address: facultyData.address,
          gender: facultyData.gender
        })
        .eq('id', supervisor.id);

      // Don't throw error if faculty record doesn't exist
      if (facultyError && facultyError.code !== 'PGRST116') {
        console.warn('Faculty record not found, but supervisor updated successfully');
      }

      setOriginalData(facultyData);
      setIsEditing(false);
      toast.success('Supervisor information updated successfully!');
    } catch (error) {
      console.error('Error saving supervisor data:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFacultyData(originalData);
    setIsEditing(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!facultyData) return;
    setFacultyData({
      ...facultyData,
      [field]: value
    } as typeof facultyData);
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
                  >                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                      {student.register_no && (
                        <p className="text-sm text-gray-500">({student.register_no})</p>
                      )}
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
      ) : (        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Supervisor Details</h2>
              <p className="text-sm text-gray-500">
                Register No: {facultyData?.register_no || supervisor.register_no || supervisor.id}
              </p>
            </div>            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  {facultyData && (
                    <button
                      onClick={handleSetAsFaculty}
                      disabled={isLoadingFacultyStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Set supervisor back to faculty"
                    >
                      <UserCheck className="h-4 w-4" />
                      {isLoadingFacultyStatus ? 'Processing...' : 'Set as Faculty'}
                    </button>
                  )}
                </>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
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
              </div>              <div className="grid gap-2 max-h-[40vh] overflow-y-auto pr-2">
                {isLoadingAssigned ? (
                  <div className="text-center py-4">Loading assigned students...</div>
                ) : assignedStudents.length > 0 ? (                  assignedStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                        {student.register_no && (
                          <p className="text-sm text-gray-500">({student.register_no})</p>
                        )}
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          {student.student_source?.[0]?.status || 'Active'}
                        </span>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                          title="Remove student assignment"
                        >
                          <UserMinus className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No students assigned yet
                  </div>
                )}              </div>
            </div>{isEditing && facultyData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                  label="Name"
                  value={facultyData.name || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('name', value)}
                  type="text"
                />
                <InfoField
                  label="Email"
                  value={facultyData.email || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('email', value)}
                  type="email"
                />
                <InfoField
                  label="Phone"
                  value={facultyData.phone_no || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('phone_no', value)}
                  type="tel"
                />
                <InfoField
                  label="Department"
                  value={facultyData.department || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('department', value)}
                  type="text"
                />
                <InfoField
                  label="Join Date"
                  value={facultyData.join_date || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('join_date', value)}
                  type="date"
                />
                <InfoField
                  label="Role"
                  value={facultyData.role || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('role', value)}
                  type="text"
                />
                <InfoField
                  label="Date of Birth"
                  value={facultyData.dob || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('dob', value)}
                  type="date"
                />
                <InfoField
                  label="Marital Status"
                  value={facultyData.martialstatus || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('martialstatus', value)}
                  type="text"
                />
                <InfoField
                  label="Gender"
                  value={facultyData.gender || ''}
                  isEditing={isEditing}
                  onChange={(value) => handleFieldChange('gender', value)}
                  type="text"
                />
                <div className="sm:col-span-2">
                  <InfoField
                    label="Address"
                    value={facultyData.address || ''}
                    isEditing={isEditing}
                    onChange={(value) => handleFieldChange('address', value)}
                    type="textarea"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
