import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Search, Download, MoreVertical, Mail, Phone } from "lucide-react"

interface Student {
  id: string
  name: string
  enrollDate: string
  course: string
  status: 'active' | 'pending' | 'suspended' | 'alumni'
  email: string
  phone: string
}

const recentStudents: Student[] = [
  { id: "1", name: "Arjun Kumar", enrollDate: "2024-01-15", course: "B.Tech Computer Science", status: "active", email: "arjun@example.com", phone: "944-756-7890" },
  { id: "2", name: "Priya Sharma", enrollDate: "2024-01-14", course: "M.Tech Data Science", status: "pending", email: "priya@example.com", phone: "855-654-3210" },
  { id: "3", name: "Rahul Menon", enrollDate: "2024-01-13", course: "B.Tech AI & ML", status: "active", email: "rahul@example.com", phone: "944-789-0123" },
  { id: "4", name: "Sneha Patel", enrollDate: "2024-01-12", course: "MCA", status: "suspended", email: "sneha@example.com", phone: "934-123-4560" },
  { id: "5", name: "Arun Nair", enrollDate: "2024-01-11", course: "B.Tech Electronics", status: "active", email: "arun@example.com", phone: "944-654-0987" },
];

const getStatusStyles = (status: Student['status']) => {
  const styles = {
    active: 'bg-[#27AE60]/20 text-[#27AE60]',
    pending: 'bg-[#F39C12]/20 text-[#F39C12]',
    suspended: 'bg-[#E74C3C]/20 text-[#E74C3C]',
    alumni: 'bg-[#2C3E50]/20 text-[#2C3E50]',
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

const formatStatus = (status: string) => status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")

export default function RecentStudents() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = recentStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Name,Enroll Date,Course,Status,Email,Phone"]
      .concat(filteredStudents.map(student => 
        `${student.name},${student.enrollDate},${student.course},${student.status},${student.email},${student.phone}`
      )).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "recent_students.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="p-6 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#2C3E50]/10">
            <Users className="w-5 h-5 text-[#2C3E50]" />
          </div>
          <h3 className="text-md font-semibold text-[#2C3E50]">Recent Students</h3>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-48 md:w-64">
            <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#34495E]" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-[#ECF0F1] focus:outline-none focus:ring-2 focus:ring-[#2C3E50] bg-white/80 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-[#2C3E50]/90 transition-colors"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="hidden sm:table w-full">
          <thead>
            <tr className="text-left border-b border-[#ECF0F1]">
              {['Student Name', 'Enroll Date', 'Course', 'Status', 'Contact', ''].map((header) => (
                <th key={header} className="py-3 px-4 text-sm font-semibold text-[#34495E]">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-800">{student.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.enrollDate}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.course}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(student.status)}`}>
                    {formatStatus(student.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{student.email}</div>
                    <div className="text-gray-600">{student.phone}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sm:hidden space-y-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-800">{student.name}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(student.status)}`}>
                      {formatStatus(student.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{student.course}</p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 ml-2">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <div className="text-gray-600 mb-1">Enroll Date</div>
                  <div className="font-medium">{student.enrollDate}</div>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-3 mt-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-gray-900">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-4">
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View More</button>
      </div>
    </Card>
  )
}