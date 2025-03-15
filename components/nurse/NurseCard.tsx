import { CheckCircle, Clock, AlertCircle } from "lucide-react"

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
  rating ?: number
  experience: number
  preferredLocations: string[]
}

const statusColors = {
  assigned: "bg-green-100 text-green-700 border border-green-200",
  leave: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  unassigned: "bg-red-100 text-red-700 border border-red-200",
  pending: "bg-gray-100 text-gray-700 border border-gray-200",
  under_review: "bg-blue-100 text-blue-700 border border-blue-200",
  rejected: "bg-purple-100 text-purple-700 border border-purple-200"
}

const statusIcons = {
  assigned: CheckCircle,
  leave: Clock,
  unassigned: AlertCircle,
  pending: Clock,
  under_review: Clock,
  rejected: AlertCircle
}

const NurseCard = ({ nurse, onReviewDetails }: { nurse: Nurse, onReviewDetails: (nurse: Nurse) => void }) => {
  const StatusIcon = statusIcons[nurse.status]
  return (
    <div key={nurse._id} className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{`${nurse.firstName} ${nurse.lastName}`}</h3>
          {/* <p className="text-sm text-gray-600">{nurse.location}</p> */}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[nurse.status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {nurse.status.replace("_", " ").charAt(0).toUpperCase() + nurse.status.slice(1).replace("_", " ")}
        </span>
      </div>
      
      <div className="text-sm">
        <p className="text-gray-600">Experience: {nurse.experience} years</p>
        <p className="text-gray-600">Rating: {nurse.rating} stars</p>
        <p className="text-gray-900">{nurse.email}</p>
        <p className="text-gray-600">{nurse.phoneNumber}</p>
      </div>
      
      <button 
        className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
        onClick={() => onReviewDetails(nurse)}
      >
        Review Details
      </button>
    </div>
  )
}

export default NurseCard
