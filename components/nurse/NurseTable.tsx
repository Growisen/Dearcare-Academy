import { CheckCircle, CalendarX, AlertCircle, Clock, FileClock, XCircle, Star } from "lucide-react"

interface Nurse {
    _id: string
    firstName: string
    lastName: string
    email: string
    location: string
    phoneNumber: string
    gender: string
    dob: string
    salaryCap: number
    hiringDate?: string
    status: "assigned" | "leave" | "unassigned" | "pending" | "under_review" | "rejected"
    rating?: number
    experience: number
    preferredLocations: string[]
}

const statusColors = {
  assigned: "bg-green-200 text-green-800 border border-green-300",
  leave: "bg-yellow-200 text-yellow-800 border border-yellow-300",
  unassigned: "bg-purple-200 text-purple-800 border border-purple-300",
  pending: "bg-gray-200 text-gray-800 border border-gray-300",
  under_review: "bg-blue-200 text-blue-800 border border-blue-300",
  rejected: "bg-red-200 text-red-800 border border-red-300"
}

const statusIcons = {
  assigned: CheckCircle,
  leave: CalendarX,
  unassigned: AlertCircle,
  pending: Clock,
  under_review: FileClock,
  rejected: XCircle
}

const NurseTable = ({ nurses, onReviewDetails }: { nurses: Nurse[], onReviewDetails: (nurse: Nurse) => void }) => (
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr className="text-left">
        <th className="py-4 px-6 font-semibold text-gray-700">Nurse Name</th>
        <th className="py-4 px-6 font-semibold text-gray-700">Status</th>
        <th className="py-4 px-6 font-semibold text-gray-700">Experience</th>
        <th className="py-4 px-6 font-semibold text-gray-700">Rating</th>
        <th className="py-4 px-6 font-semibold text-gray-700">Contact</th>
        <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {nurses.map((nurse) => {
        const StatusIcon = statusIcons[nurse.status]
        return (
          <tr key={nurse._id} className="hover:bg-gray-50/50">
            <td className="py-4 px-6 text-gray-900 font-medium">{`${nurse.firstName} ${nurse.lastName}`}</td>
            <td className="py-4 px-6">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[nurse.status]}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {nurse.status.replace("_", " ").charAt(0).toUpperCase() + nurse.status.slice(1).replace("_", " ")}
              </span>
            </td>
            <td className="py-4 px-6 text-gray-700">{nurse.experience} years</td>
            <td className="py-4 px-6 text-gray-700 align-middle">
              {nurse.rating} <Star className="inline ml-1 sm:mb-1 w-4 h-4 text-yellow-500" />
            </td>
            <td className="py-4 px-6">
              <div>
                <div className="text-gray-900">{nurse.email}</div>
                <div className="text-gray-600">{nurse.phoneNumber}</div>
                {/* <div className="text-gray-600">{nurse.location}</div> */}
              </div>
            </td>
            <td className="py-4 px-6">
              <button 
                className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                onClick={() => onReviewDetails(nurse)}
              >
                Review Details
              </button>
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
)

export default NurseTable
