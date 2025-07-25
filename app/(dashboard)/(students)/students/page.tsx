"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Search, CheckCircle, Clock, User, XCircle, Users, ArrowUpDown } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { AddStudentOverlay } from "../../../../components/students/add-student-overlay";
import { StudentDetailsOverlay } from "../../../../components/students/student-details-overlay";
import { AssignBatchOverlay } from "../../../../components/students/assign-batch-overlay";
import { BatchTransferOverlay } from "../../../../components/students/batch-transfer-overlay";
import { StudentFormData, DatabaseStudent, Student } from "../../../../types/student.types";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<DatabaseStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignOverlay, setShowAssignOverlay] = useState(false);
  const [showBatchAssignOverlay, setShowBatchAssignOverlay] = useState(false);
  const [showBatchTransferOverlay, setShowBatchTransferOverlay] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [hasNewStudents, setHasNewStudents] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const statusColors = {
    confirmed: "bg-green-100 text-green-700 border border-green-200",
    "follow-up": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    new: "bg-blue-100 text-blue-700 border border-blue-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
  };

  const statusIcons = {
    confirmed: CheckCircle,
    "follow-up": Clock,
    new: User,
    rejected: XCircle,
  };
  useEffect(() => {
    const checkAuth = async () => {
      const { checkAuthStatus } = await import('../../../../lib/auth');
      const currentUser = await checkAuthStatus();
      
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/signin');
        return;
      }

      setAuthChecked(true);
      fetchStudents();
    };
    
    checkAuth();
  }, [router]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_source!student_source_student_id_fkey (
            status,
            priority
          ),
          student_preferences (
            home_care,
            delivery_care,
            old_age_home,
            hospital_care,
            senior_citizen_assist,
            icu_home_care,
            critical_illness_care,
            companionship,
            clinical_assist
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkForNewStudents = () => {
      const newStudents = students.some(student => 
        student.student_source?.[0]?.status?.toLowerCase() === 'new'
      );
      setHasNewStudents(newStudents);
    };
    
    checkForNewStudents();
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const sourceStatus = student.student_source?.[0]?.status?.toLowerCase() || '';
    const matchesStatus = selectedStatus === "all" ? true : sourceStatus === selectedStatus;
    const matchesBatch = selectedBatch === "all" ? true : 
      (selectedBatch === "unassigned" ? !student.batch : student.batch === selectedBatch);
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      student.mobile?.toLowerCase().includes(searchTerm) ||
      (student.register_no && student.register_no.toLowerCase().includes(searchTerm)) ||
      (student.batch && student.batch.toLowerCase().includes(searchTerm));
    return matchesStatus && matchesBatch && matchesSearch;
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedBatch, searchQuery]);

  const getPreferredCourse = (preferences: Record<string, string> = {}) => {
    const interestedService = Object.entries(preferences)
      .find(([, interest]) => interest === 'Interested')?.[0];
      
    if (!interestedService) return 'Not specified';
    
    return interestedService
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getLocationString = (student: DatabaseStudent) => {
    const parts = [];
    if (student.city) parts.push(student.city);
    if (student.state) parts.push(student.state);
    return parts.join(', ') || 'Location not specified';
  };

  const handleAssignStudent = (formData: StudentFormData) => {
    console.log("New student data:", formData);
    fetchStudents();
  };

  const renderPaginationControls = () => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastStudent, filteredStudents.length)}
              </span>{' '}
              of <span className="font-medium">{filteredStudents.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    page === currentPage
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                  } ${page === 1 ? 'rounded-l-md' : ''} ${
                    page === totalPages ? 'rounded-r-md' : ''
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!authChecked ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Students
                </h1>
                
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  onClick={() => setShowBatchAssignOverlay(true)}
                >
                  <Users className="h-4 w-4" />
                  Assign Batch
                </button>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  onClick={() => setShowBatchTransferOverlay(true)}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Batch Transfer
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowAssignOverlay(true)}
                >
                  Add Student
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["all", "confirmed", "follow-up", "new", "rejected"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        selectedStatus === status
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {hasNewStudents && status === "new" && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </button>
                  )
                )}
              </div>
              
              {/* Batch Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter by Batch:</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Batches</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="A">Batch A</option>
                  <option value="B">Batch B</option>
                  <option value="C">Batch C</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No students found</div>
              ) : (
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-left">
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Full Name
                        </th>
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Course
                        </th>
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Batch
                        </th>
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Roll No
                        </th>
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Contact
                        </th>
                        <th className="py-4 px-6 font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentStudents.map((student) => {
                        const status = student.student_source?.[0]?.status?.toLowerCase() || 'new';
                        const StatusIcon = statusIcons[status as keyof typeof statusIcons];

                        return (                          <tr key={student.id} className="hover:bg-gray-50/50">
                            <td className="py-4 px-6 text-gray-900">
                              <div className="font-medium">{student.name}</div>
                              {student.register_no && (
                                <div className="text-sm text-gray-500">({student.register_no})</div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {student.course}
                            </td>
                            <td className="py-4 px-6">
                              {student.batch ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Batch {student.batch}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {student.roll_no || '-'}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                statusColors[status as keyof typeof statusColors]
                              }`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <div className="text-gray-900">{student.email}</div>
                                <div className="text-gray-600">{student.mobile}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">                              <button
                                className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                onClick={() => setSelectedStudent({
                                  id: student.id,
                                  fullName: student.name,
                                  email: student.email,
                                  phone: student.mobile,
                                  course: student.course,
                                  status: status as "confirmed" | "follow-up" | "new" | "rejected",
                                  enrollmentDate: new Date(student.created_at).toISOString().split('T')[0],
                                  location: getLocationString(student),
                                  register_no: student.register_no,
                                  batch: student.batch,
                                  roll_no: student.roll_no,
                                })}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredStudents.length > 0 && renderPaginationControls()}

              <div className="sm:hidden divide-y divide-gray-200">
                {currentStudents.map((student) => {
                  const status = student.student_source?.[0]?.status?.toLowerCase() || 'new';
                  const StatusIcon = statusIcons[status as keyof typeof statusIcons];
                  const preferredCourse = getPreferredCourse(student.student_preferences?.[0]);

                  return (
                    <div key={student.id} className="p-4 space-y-3">                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {student.name}
                          </h3>
                          {student.register_no && (
                            <p className="text-sm text-gray-500">({student.register_no})</p>
                          )}
                          <p className="text-sm text-gray-600">{preferredCourse}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                            statusColors[status as keyof typeof statusColors]
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-900">{student.email}</p>
                        <p className="text-gray-600">{student.mobile}</p>
                        {(student.batch || student.roll_no) && (
                          <p className="text-gray-600 mt-1">
                            {student.batch && `Batch: ${student.batch}`}
                            {student.batch && student.roll_no && ' • '}
                            {student.roll_no && `Roll: ${student.roll_no}`}
                          </p>
                        )}
                      </div>                      <button
                        className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => setSelectedStudent({
                          id: student.id,
                          fullName: student.name,
                          email: student.email,
                          phone: student.mobile,
                          course: student.course,
                          status: status as "confirmed" | "follow-up" | "new" | "rejected",
                          enrollmentDate: new Date(student.created_at).toISOString().split('T')[0],
                          location: getLocationString(student),
                          register_no: student.register_no,
                          batch: student.batch,
                          roll_no: student.roll_no,
                        })}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {showAssignOverlay && (
            <AddStudentOverlay
              supervisorId="1"
              onClose={() => setShowAssignOverlay(false)}
              onAssign={handleAssignStudent}
            />
          )}

          {showBatchAssignOverlay && (
            <AssignBatchOverlay
              onClose={() => setShowBatchAssignOverlay(false)}
              onAssign={() => {
                setShowBatchAssignOverlay(false);
                fetchStudents();
              }}
            />
          )}

          {showBatchTransferOverlay && (
            <BatchTransferOverlay
              onClose={() => setShowBatchTransferOverlay(false)}
              onTransfer={() => {
                setShowBatchTransferOverlay(false);
                fetchStudents();
              }}
            />
          )}

          {selectedStudent && (
            <StudentDetailsOverlay
              student={{
                id: selectedStudent.id,
                name: selectedStudent.fullName,
                email: selectedStudent.email,
                phone: selectedStudent.phone,
                course: selectedStudent.course,
                service: selectedStudent.course,
                requestDate: selectedStudent.enrollmentDate,
                status: selectedStudent.status,
                location: selectedStudent.location,
                dateOfBirth: "Not specified",
                age: "Not specified",
                gender: "Not specified",
                register_no: selectedStudent.register_no,
                batch: selectedStudent.batch,
                roll_no: selectedStudent.roll_no,
              }}
              onClose={() => setSelectedStudent(null)}
            />
          )}
        </div>
      )}
    </>
  );
}
