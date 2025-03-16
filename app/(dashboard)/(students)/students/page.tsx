"use client";
import { useState } from "react";
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

const mockStudents: Student[] = [
  {
    id: "1",
    fullName: "Arun Kumar",
    course: "Geriatric Care Specialist",
    status: "confirmed",
    email: "arun.k@example.com",
    phone: "9446543210",
    enrollmentDate: "2023-08-15",
    location: "Thiruvananthapuram, Kerala"
  },
  {
    id: "2",
    fullName: "Priya Menon",
    course: "Palliative Care Nursing",
    status: "follow-up",
    email: "priya.m@example.com",
    phone: "9447543211",
    enrollmentDate: "2023-08-20",
    location: "Kochi, Kerala"
  },
  {
    id: "3",
    fullName: "Mohammed Ashraf",
    course: "Emergency Care Assistant",
    status: "new",
    email: "ashraf.m@example.com",
    phone: "9448543212",
    enrollmentDate: "2023-08-25",
    location: "Kozhikode, Kerala"
  },
  {
    id: "4",
    fullName: "Lakshmi Nair",
    course: "Pediatric Care Specialist",
    status: "rejected",
    email: "lakshmi.n@example.com",
    phone: "9449543213",
    enrollmentDate: "2023-08-10",
    location: "Thrissur, Kerala"
  },
  {
    id: "5",
    fullName: "Thomas Joseph",
    course: "Geriatric Care Specialist",
    status: "confirmed",
    email: "thomas.j@example.com",
    phone: "9446123456",
    enrollmentDate: "2023-09-01",
    location: "Kollam, Kerala"
  },
  {
    id: "6",
    fullName: "Fathima Beevi",
    course: "Emergency Care Assistant",
    status: "new",
    email: "fathima.b@example.com",
    phone: "9447987654",
    enrollmentDate: "2023-09-05",
    location: "Malappuram, Kerala"
  }
];

export default function StudentsPage() {
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

  const filteredStudents = mockStudents.filter((student) => {
    const matchesStatus =
      selectedStatus === "all" ? true : student.status === selectedStatus;
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAssignStudent = (formData: any) => {
    // Handle the form data here
    console.log("New student data:", formData);
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
                  const StatusIcon = statusIcons[student.status];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        {student.fullName}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {student.course}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                            statusColors[student.status]
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {student.status.charAt(0).toUpperCase() +
                            student.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900">{student.email}</div>
                          <div className="text-gray-600">{student.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          onClick={() => setSelectedStudent(student)}
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

          {/* Mobile view */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const StatusIcon = statusIcons[student.status];
              return (
                <div key={student.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {student.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">{student.course}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                        statusColors[student.status]
                      }`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {student.status.charAt(0).toUpperCase() +
                        student.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-900">{student.email}</p>
                    <p className="text-gray-600">{student.phone}</p>
                  </div>
                  <button
                    className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    onClick={() => setSelectedStudent(student)}
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
