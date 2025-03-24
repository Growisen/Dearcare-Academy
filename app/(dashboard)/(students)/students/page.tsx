"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../../supabase/db";
import { Search, CheckCircle, Clock, User, XCircle } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { AddStudentOverlay } from "../../../../components/students/add-student-overlay";
import { StudentDetailsOverlay } from "../../../../components/students/student-details-overlay";

interface Student {
  id: string;
  fullName: string;
  course: string;
  status: "confirmed" | "follow-up" | "new" | "rejected";
  email: string;
  phone: string;
  enrollmentDate: string;
  location: string;
}

interface DatabaseStudent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  created_at: string;
  status?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<DatabaseStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignOverlay, setShowAssignOverlay] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_source (
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
        `);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const sourceStatus = student.student_source?.[0]?.status?.toLowerCase() || '';
    const matchesStatus = selectedStatus === "all" ? true : sourceStatus === selectedStatus;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getPreferredCourse = (preferences: Record<string, string> = {}) => {
    const interestedService = Object.entries(preferences)
      .find(([, interest]) => interest === 'Interested')?.[0];
      
    if (!interestedService) return 'Not specified';
    
    return interestedService
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAssignStudent = (formData: StudentFormData) => {
    // Handle the form data here
    console.log("New student data:", formData);
    fetchStudents(); // Refresh the students list after adding new student
  };

  return (
    <div>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Students
          </h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAssignOverlay(true)}
          >
            Add Student
          </button>
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
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
                  {filteredStudents.map((student) => {
                    const status = student.student_source?.[0]?.status?.toLowerCase() || 'new';
                    const StatusIcon = statusIcons[status as keyof typeof statusIcons];
                    const preferredCourse = getPreferredCourse(student.student_preferences?.[0]);

                    return (
                      <tr key={student.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6 text-gray-900 font-medium">
                          {student.name}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {preferredCourse}
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
                        <td className="py-4 px-6">
                          <button
                            className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                            onClick={() => setSelectedStudent({
                              id: student.id,
                              fullName: student.name,
                              email: student.email,
                              phone: student.mobile,
                              course: preferredCourse,
                              status: status,
                              enrollmentDate: new Date(student.created_at).toISOString().split('T')[0],
                              location: `${student.city}, ${student.state}`
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

          {/* Mobile view */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const status = student.student_source?.[0]?.status?.toLowerCase() || 'new';
              const StatusIcon = statusIcons[status as keyof typeof statusIcons];
              const preferredCourse = getPreferredCourse(student.student_preferences?.[0]);

              return (
                <div key={student.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {student.name}
                      </h3>
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
                  </div>
                  <button
                    className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    onClick={() => setSelectedStudent({
                      id: student.id,
                      fullName: student.name,
                      email: student.email,
                      phone: student.mobile,
                      course: preferredCourse,
                      status: status,
                      enrollmentDate: new Date(student.created_at).toISOString().split('T')[0],
                      location: `${student.city}, ${student.state}`
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
          supervisorId="1" // Pass actual supervisor ID if needed
          onClose={() => setShowAssignOverlay(false)}
          onAssign={handleAssignStudent}
        />
      )}

      {selectedStudent && (
        <StudentDetailsOverlay
          client={{
            id: selectedStudent.id,
            name: selectedStudent.fullName,
            email: selectedStudent.email,
            phone: selectedStudent.phone,
            service: selectedStudent.course,
            requestDate: selectedStudent.enrollmentDate,
            status: selectedStudent.status,
            location: selectedStudent.location,
          }}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
