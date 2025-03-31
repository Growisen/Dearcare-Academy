"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, CheckCircle, Book } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { FacultyDetailsOverlay } from "../../../../components/faculty/faculty-details-overlay"
import { supabase } from "../../../lib/supabase"
import type { DatabaseFaculty } from "../../../../types/faculty.types"


interface AssignedStudent {
  id: number;
  name: string;
  email: string;
  student_source: { status: string }[];
}

interface Faculty {
  id: string
  name: string
  joinDate: string
  department: string
  status: "active" | "on_leave" | "inactive"
  email: string
  phone: string
  assignedStudents: AssignedStudent[]
}

/*
interface SupervisorAssignmentResponse {
  student: {
    id: number;
    name: string;
    email: string;
    student_source: Array<{
      status: string;
    }>;
  };
}
  */

export default function FacultiesPage() {
  const router = useRouter()
  const [Faculties, setFaculties] = useState<Faculty[]>([])
  //const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }

      const { data: userRole } = await supabase
        .from('academy_roles')
        .select('role')
        .eq('uid', session.user.id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        router.push('/signin');
        return;
      }

      setAuthChecked(true);
      fetchFaculties();
    };
    
    checkAuth();
  }, [router]);

  async function fetchFaculties() {
    try {
      //setLoading(true)
      const { data: dbFaculties, error } = await supabase
        .from('academy_faculties')
        .select('*')

      if (error) {
        console.error('Error fetching supervisors:', error)
        return
      }

      const formattedFaculties: Faculty[] = await Promise.all(
        (dbFaculties as DatabaseFaculty[]).map(async (fac) => {
          const { data: assignedStudents } = await supabase
            .from('faculty_assignments')
            .select(`
              student:students (
                id,
                name,
                email,
                student_source (
                  status
                )
              )
            `)
            .eq('faculty_id', fac.id)

          const students = (assignedStudents || []).flatMap((assignment: { student: { id: number; name: string; email: string; student_source: { status: string }[] }[] }) =>
            assignment.student.map((student) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              student_source: student.student_source || [{ status: 'unknown' }]
            }))
          )

          return {
            id: fac.id.toString(),
            name: fac.name || '',
            joinDate: fac.join_date || '',
            department: fac.department || '',
            status: 'active',
            email: fac.email || '',
            phone: fac.phone_no || '',
            faculties: [],
            assignedStudents: students
          }
        })
      )

      setFaculties(formattedFaculties)
    } catch (error) {
      console.error('Error fetching supervisors:', error)
    } finally {
      //setLoading(false)
    }
  }

  const statusColors = {
    active: "bg-green-100 text-green-700 border border-green-200",
    on_leave: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    inactive: "bg-red-100 text-red-700 border border-red-200"
  }

  const statusIcons = {
    active: CheckCircle,
    on_leave: Eye,
    inactive: Book
  }

  const filteredFaculties = Faculties.filter(faculty => {
    const matchesStatus = selectedStatus === "all" ? true : faculty.status === selectedStatus
    const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faculty.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <>
      {!authChecked ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Supervisors</h1>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Supervisor
              </button>
            </div>

            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search supervisors..."
                  className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["all", "active", "on_leave", "inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left">
                      <th className="py-4 px-6 font-semibold text-gray-700">Supervisor Name</th>
                      <th className="py-4 px-6 font-semibold text-gray-700">Join Date</th>
                      <th className="py-4 px-6 font-semibold text-gray-700">Department</th>
                      <th className="py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="py-4 px-6 font-semibold text-gray-700">Contact</th>
                      <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFaculties.map((faculty) => {
                      const StatusIcon = statusIcons[faculty.status];
                      return (
                        <tr key={faculty.id} className="hover:bg-gray-50/50">
                          <td className="py-4 px-6 text-gray-900 font-medium">{faculty.name}</td>
                          <td className="py-4 px-6 text-gray-700">{faculty.joinDate}</td>
                          <td className="py-4 px-6 text-gray-700">{faculty.department}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[faculty.status]}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {faculty.status.replace("_", " ").charAt(0).toUpperCase() + faculty.status.slice(1).replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="text-gray-900">{faculty.email}</div>
                              <div className="text-gray-600">{faculty.phone}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button 
                              className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                              onClick={() => setSelectedFaculty(faculty)}
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
                {filteredFaculties.map((faculty) => {
                  const StatusIcon = statusIcons[faculty.status];
                  return (
                    <div key={faculty.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{faculty.name}</h3>
                          <p className="text-sm text-gray-600">{faculty.department}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[faculty.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {faculty.status.replace("_", " ").charAt(0).toUpperCase() + faculty.status.slice(1).replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Join Date: {faculty.joinDate}</p>
                        <p className="text-gray-900">{faculty.email}</p>
                        <p className="text-gray-600">{faculty.phone}</p>
                      </div>
                      <button 
                        className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => setSelectedFaculty(faculty)}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedFaculty && (
            <FacultyDetailsOverlay 
              faculty={selectedFaculty} 
              onClose={() => setSelectedFaculty(null)} 
            />
          )}
        </div>
      )}
    </>
  )
}
