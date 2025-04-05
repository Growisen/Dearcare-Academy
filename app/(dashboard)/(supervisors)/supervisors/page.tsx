"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, CheckCircle, Book } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { SupervisorDetailsOverlay } from "../../../../components/supervisor/supervisor-details-overlay"
import { supabase } from "../../../../lib/supabase"
import type { DatabaseSupervisor } from "../../../../types/supervisors.types"

interface Faculty {
  id: string
  name: string
  subject: string
  students: string[]
}

interface AssignedStudent {
  id: number;
  name: string;
  email: string;
  student_source: { status: string }[];
}

interface Supervisor {
  id: string
  name: string
  joinDate: string
  department: string
  status: "active" | "on_leave" | "inactive"
  email: string
  phone: string
  faculties: Faculty[]
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

export default function SupervisorsPage() {
  const router = useRouter()
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  //const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null)

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
      fetchSupervisors();
    };
    
    checkAuth();
  }, [router]);

  async function fetchSupervisors() {
    try {
      //setLoading(true)
      const { data: dbSupervisors, error } = await supabase
        .from('academy_supervisors')
        .select('*')

      if (error) {
        console.error('Error fetching supervisors:', error)
        return
      }

      const formattedSupervisors: Supervisor[] = await Promise.all(
        (dbSupervisors as DatabaseSupervisor[]).map(async (sup) => {
          const { data: assignedStudents } = await supabase
            .from('supervisor_assignments')
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
            .eq('supervisor_id', sup.id)

          const students = (assignedStudents || []).flatMap((assignment: { student: { id: number; name: string; email: string; student_source: { status: string }[] }[] }) =>
            assignment.student.map((student) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              student_source: student.student_source || [{ status: 'unknown' }]
            }))
          )

          return {
            id: sup.id.toString(),
            name: sup.name || '',
            joinDate: sup.join_date || '',
            department: sup.department || '',
            status: 'active',
            email: sup.email || '',
            phone: sup.phone_no || '',
            faculties: [],
            assignedStudents: students
          }
        })
      )

      setSupervisors(formattedSupervisors)
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

  const filteredSupervisors = supervisors.filter(supervisor => {
    const matchesStatus = selectedStatus === "all" ? true : supervisor.status === selectedStatus
    const matchesSearch = supervisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supervisor.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {filteredSupervisors.map((supervisor) => {
                      const StatusIcon = statusIcons[supervisor.status];
                      return (
                        <tr key={supervisor.id} className="hover:bg-gray-50/50">
                          <td className="py-4 px-6 text-gray-900 font-medium">{supervisor.name}</td>
                          <td className="py-4 px-6 text-gray-700">{supervisor.joinDate}</td>
                          <td className="py-4 px-6 text-gray-700">{supervisor.department}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[supervisor.status]}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {supervisor.status.replace("_", " ").charAt(0).toUpperCase() + supervisor.status.slice(1).replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="text-gray-900">{supervisor.email}</div>
                              <div className="text-gray-600">{supervisor.phone}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button 
                              className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                              onClick={() => setSelectedSupervisor(supervisor)}
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
                {filteredSupervisors.map((supervisor) => {
                  const StatusIcon = statusIcons[supervisor.status];
                  return (
                    <div key={supervisor.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{supervisor.name}</h3>
                          <p className="text-sm text-gray-600">{supervisor.department}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[supervisor.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {supervisor.status.replace("_", " ").charAt(0).toUpperCase() + supervisor.status.slice(1).replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Join Date: {supervisor.joinDate}</p>
                        <p className="text-gray-900">{supervisor.email}</p>
                        <p className="text-gray-600">{supervisor.phone}</p>
                      </div>
                      <button 
                        className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => setSelectedSupervisor(supervisor)}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedSupervisor && (
            <SupervisorDetailsOverlay 
              supervisor={selectedSupervisor} 
              onClose={() => setSelectedSupervisor(null)} 
            />
          )}
        </div>
      )}
    </>
  )
}
