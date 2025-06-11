import React, { useState, useEffect } from 'react';
import { X, UserCheck, UserMinus, Edit, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface FacultyDetailsProps {
  faculty: { id: string };
  onClose: () => void;
}

interface DocumentData {
  photo: string | null;
  certificates: string[];
}

interface WorkExperience {
  organization: string;
  posted_role: string;
  duration: string;
  responsibilities: string;
}

// interface Student {
//   id: string;
//   name: string;
//   email: string;
//   student_source?: { status: string }[];
// }

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
        {value || 'N/A'}
      </div>
    )}
  </div>
);

export function FacultyDetailsOverlay({ faculty, onClose }: FacultyDetailsProps) {  const [facultyData, setFacultyData] = useState<{
    name: string;
    dob: string;
    gender: string;
    martialstatus: string;
    email: string;
    phone_no: string;
    address: string;
    join_date: string;
    department: string;
    role: string;
    register_no: string;
  } | null>(null);

  const [originalData, setOriginalData] = useState<typeof facultyData>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [documents, setDocuments] = useState<DocumentData>({
    photo: null,
    certificates: [],
  });
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isLoadingSupervisorStatus, setIsLoadingSupervisorStatus] = useState(false);
  // const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  // const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  // const [showAssignList, setShowAssignList] = useState(false);
  // const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  useEffect(() => {
    fetchFacultyDetails();
    fetchWorkExperiences();
    fetchDocuments();
    checkSupervisorStatus();
    // fetchAssignedStudents();
    // fetchUnassignedStudents();
  }, [faculty.id]);

  // useEffect(() => {
  //   if (showAssignList) {
  //     fetchUnassignedStudents();
  //   }
  // }, [showAssignList]);
  const fetchFacultyDetails = async () => {
    const { data, error } = await supabase
      .from('academy_faculties')
      .select('*')
      .eq('id', faculty.id)
      .single();

    if (error) {
      console.error('Error fetching faculty details:', error);
    } else {
      setFacultyData(data);
      setOriginalData(data);
    }
  };

  const fetchWorkExperiences = async () => {
    const { data, error } = await supabase
      .from('faculty_experiences')
      .select('*')
      .eq('faculty_id', faculty.id);

    if (error) {
      console.error('Error fetching work experiences:', error);
    } else {
      setWorkExperiences(data || []);
    }
  };
  const fetchDocuments = async () => {
    try {
      const folderPath = `Faculties/${faculty.id}`;
      const { data: photoData } = await supabase.storage
        .from('dearcare')
        .list(folderPath, { limit: 1, search: 'photo.jpg' });

      const { data: certificateData } = await supabase.storage
        .from('dearcare')
        .list(`${folderPath}/certificate`);

      setDocuments({
        photo: photoData?.[0]?.name ? `${folderPath}/${photoData[0].name}` : null,
        certificates: certificateData?.map((file) => `${folderPath}/certificate/${file.name}`) || [],
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const checkSupervisorStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_supervisors')
        .select('id')
        .eq('id', faculty.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking supervisor status:', error);
      } else {
        setIsSupervisor(!!data);
      }
    } catch (error) {
      console.error('Error checking supervisor status:', error);
    }
  };  const handleSupervisorToggle = async () => {
    if (!facultyData) return;

    setIsLoadingSupervisorStatus(true);
    try {
      if (isSupervisor) {
        // Check if supervisor has assigned students before removing
        const { data: assignedStudents, error: checkError } = await supabase
          .from('supervisor_assignment')
          .select('student_id')
          .eq('supervisor_id', faculty.id);

        if (checkError) {
          console.error('Error checking assigned students:', checkError);
          toast.error('Failed to check supervisor status. Please try again.');
          return;
        }

        if (assignedStudents && assignedStudents.length > 0) {
          // Supervisor has assigned students, show clean error message
          toast.error(
            `Cannot set supervisor back to faculty. This supervisor currently has ${assignedStudents.length} assigned student${assignedStudents.length > 1 ? 's' : ''}. Please remove all assigned students first.`,
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
          .eq('id', faculty.id);

        if (error) {
          console.error('Error removing supervisor:', error);
          toast.error('Failed to set as faculty. Please try again.');
        } else {
          setIsSupervisor(false);
          toast.success('Successfully set as faculty!');
        }
      } else {
        // Add to supervisors table
        const { error } = await supabase
          .from('academy_supervisors')
          .insert({
            id: parseInt(faculty.id),
            name: facultyData.name,
            join_date: facultyData.join_date,
            department: facultyData.department,
            email: facultyData.email,
            phone_no: facultyData.phone_no,
            role: facultyData.role,
            dob: facultyData.dob,
            martialstatus: facultyData.martialstatus,
            address: facultyData.address,
            gender: facultyData.gender,
          });

        if (error) {
          console.error('Error adding supervisor:', error);
          toast.error('Failed to upgrade to supervisor. Please try again.');
        } else {
          setIsSupervisor(true);
          toast.success('Successfully upgraded to supervisor!');
        }      }
    } catch (error) {
      console.error('Error toggling supervisor status:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoadingSupervisorStatus(false);
    }
  };

  const handleSave = async () => {
    if (!facultyData) return;
    
    setIsSaving(true);
    try {
      // Update faculty data in the database
      const { error: facultyError } = await supabase
        .from('academy_faculties')
        .update({
          name: facultyData.name,
          dob: facultyData.dob,
          gender: facultyData.gender,
          martialstatus: facultyData.martialstatus,
          email: facultyData.email,
          phone_no: facultyData.phone_no,
          address: facultyData.address,
          join_date: facultyData.join_date,
          department: facultyData.department,
          role: facultyData.role
        })
        .eq('id', faculty.id);

      if (facultyError) throw facultyError;

      // Update work experiences
      if (workExperiences.length > 0) {
        // Delete existing experiences
        await supabase
          .from('faculty_experiences')
          .delete()
          .eq('faculty_id', faculty.id);

        // Insert new experiences
        const experienceRecords = workExperiences.map(exp => ({
          faculty_id: parseInt(faculty.id),
          organization: exp.organization,
          posted_role: exp.posted_role,
          duration: exp.duration,
          responsibilities: exp.responsibilities
        }));

        const { error: expError } = await supabase
          .from('faculty_experiences')
          .insert(experienceRecords);

        if (expError) throw expError;
      }

      setOriginalData(facultyData);
      setIsEditing(false);
      toast.success('Faculty information updated successfully!');
    } catch (error) {
      console.error('Error saving faculty data:', error);
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

  // const fetchAssignedStudents = async () => {
  //   setIsLoadingAssigned(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from('faculty_assignment')
  //       .select(`
  //         student_id,
  //         students (
  //           id,
  //           name,
  //           email,
  //           student_source (
  //             status
  //           )
  //         )
  //       `)
  //       .eq('faculty_id', faculty.id);

  //     if (error) throw error;

  //     const students = data?.map((item) => item.students).flat() || [];
  //     setAssignedStudents(students);
  //   } catch (error) {
  //     console.error('Error fetching assigned students:', error);
  //   } finally {
  //     setIsLoadingAssigned(false);
  //   }
  // };

  // const fetchUnassignedStudents = async () => {
  //   try {
  //     const { data: assignedData } = await supabase
  //       .from('faculty_assignment')
  //       .select('student_id');

  //     const assignedIds = assignedData?.map((item) => item.student_id) || [];

  //     const { data, error } = await supabase
  //       .from('students')
  //       .select(`
  //         id,
  //         name,
  //         email,
  //         student_source (
  //           status
  //         )
  //       `)
  //       .not('id', 'in', `(${assignedIds.join(',')})`);

  //     if (error) {
  //       console.error('Error fetching unassigned students:', error);
  //     } else {
  //       setUnassignedStudents(data || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching unassigned students:', error);
  //   }
  // };

  // const handleAssignStudent = async (studentId: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('faculty_assignment')
  //       .insert({
  //         faculty_id: faculty.id,
  //         student_id: studentId,
  //       });

  //     if (error) {
  //       console.error('Error assigning student:', error);
  //     } else {
  //       // Update the assigned and unassigned students lists
  //       fetchAssignedStudents();
  //       fetchUnassignedStudents();
  //     }
  //   } catch (error) {
  //     console.error('Error assigning student:', error);
  //   }
  // };

  if (!facultyData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <p>Loading faculty details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Faculty Details
              {isSupervisor && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Supervisor
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500">Register No: {facultyData.register_no || faculty.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />Edit Details
              </button>
            )}
            <button
              onClick={handleSupervisorToggle}
              disabled={isLoadingSupervisorStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSupervisor
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoadingSupervisorStatus ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSupervisor ? 'Setting as Faculty...' : 'Upgrading to Supervisor...'}
                </>
              ) : (
                <>
                  {isSupervisor ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Set as Faculty
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Upgrade to Supervisor
                    </>
                  )}
                </>
              )}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="Full Name" 
                value={facultyData.name}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('name', value)}
              />
              <InfoField 
                label="Date of Birth" 
                value={facultyData.dob}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('dob', value)}
                type="date"
              />
              <InfoField 
                label="Gender" 
                value={facultyData.gender}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('gender', value)}
              />
              <InfoField 
                label="Marital Status" 
                value={facultyData.martialstatus}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('martialstatus', value)}
              />
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="Email" 
                value={facultyData.email}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('email', value)}
                type="email"
              />
              <InfoField 
                label="Phone" 
                value={facultyData.phone_no}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('phone_no', value)}
                type="tel"
              />
              <InfoField 
                label="Address" 
                value={facultyData.address}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('address', value)}
                type="textarea"
              />
            </div>
          </section>

          {/* Current Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900">Current Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="Join Date" 
                value={facultyData.join_date}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('join_date', value)}
                type="date"
              />
              <InfoField 
                label="Department" 
                value={facultyData.department}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('department', value)}
              />
              <InfoField 
                label="Role" 
                value={facultyData.role}
                isEditing={isEditing}
                onChange={(value) => handleFieldChange('role', value)}
              />
            </div>
          </section>

          {/* Work Experience */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
            {workExperiences.length > 0 ? (
              workExperiences.map((experience, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <InfoField label="Organization" value={experience.organization} />
                  <InfoField label="Posted Role" value={experience.posted_role} />
                  <InfoField label="Duration" value={experience.duration} />
                  <InfoField label="Responsibilities" value={experience.responsibilities} />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No work experience available.</p>
            )}
          </section>

          {/* Document Upload */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
            <div className="space-y-4">
              {/* Photo */}
              {documents.photo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Photo</h4>
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dearcare/${documents.photo}`}
                    alt="Faculty Photo"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Certificates */}
              {documents.certificates.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Certificates</h4>
                  <div className="space-y-4">
                    {documents.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden mx-auto" // Center the preview
                        style={{ maxWidth: '600px' }} // Set a maximum width for the container
                      >
                        <h5 className="text-sm font-medium text-gray-700 px-4 py-2 bg-gray-100">
                          Certificate {index + 1}
                        </h5>
                        <iframe
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dearcare/${cert}`}
                          title={`Certificate ${index + 1}`}
                          className="w-full h-[50vh]" // Full width within the reduced container
                          style={{
                            border: 'none', // Remove iframe border
                            margin: 0, // Remove any margin
                            padding: 0, // Remove any padding
                            display: 'block', // Ensure it behaves like a block element
                          }}
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No certificates uploaded.</p>
              )}
            </div>
          </section>

          {/* Assigned Students */}
          {/* 
          <section>
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assigned Students</h3>
                <p className="text-sm text-gray-500">Total {assignedStudents.length} students</p>
              </div>
              { 
              // <button> ...Assign Student... </button>
              }
            </div>

            <div className="grid gap-2 max-h-[40vh] overflow-y-auto pr-2">
              {isLoadingAssigned ? (
                <div className="text-center py-4">Loading assigned students...</div>
              ) : assignedStudents.length > 0 ? (
                assignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
                  >
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
                <div className="text-center py-4 text-gray-500">No students assigned yet</div>
              )}
            </div>
          </section>
          */}
        </div>
      </div>

      {/* 
      {showAssignList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assign Students</h2>
                <p className="text-sm text-gray-500">Select students to assign</p>
              </div>
              <button
                onClick={() => setShowAssignList(false)} // Closes the overlay
                className="p-2 hover:bg-gray-50 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingAssigned ? (
                <div className="text-center py-4">Loading students...</div>
              ) : unassignedStudents.length > 0 ? (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {unassignedStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleAssignStudent(student.id)} // Assign student on click
                      className="flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:border-blue-200"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                        <p className="text-xs text-gray-500">{student.email || 'No email'}</p>
                      </div>
                      <Check className="h-5 w-5 text-blue-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No unassigned students available</div>
              )}
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
}
