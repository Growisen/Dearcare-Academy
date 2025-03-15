"use client"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { NurseDetailsOverlay } from "../../../../components/nurse/nurse-details-overlay"
import { AddNurseOverlay } from "../../../../components/nurse/add-nurse-overlay"
import NurseTable from "../../../../components/nurse/NurseTable"
import NurseCard from "../../../../components/nurse/NurseCard"

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
  reviews?: { id: string; text: string; date: string; rating: number; reviewer: string; }[];
  image?: File;
  preferredLocations: string[];
}

const mockNurses: Nurse[] = [
  {
    _id: "1",
    firstName: "Anjali",
    lastName: "Menon",
    location: "Kochi",
    status: "unassigned",
    email: "anjali.menon@example.com",
    phoneNumber: "123-456-7890",
    gender: "Female",
    dob: "1990-01-01",
    salaryCap: 50000,
    hiringDate: "2020-01-01",
    experience: 5,
    rating: 4.5,
    reviews: [
      { id: "r1", text: "Great nurse!", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
      { id: "r2", text: "Very professional.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" }
    ],
    preferredLocations: ["Kochi", "Thiruvananthapuram"]
  },
  {
    _id: "2",
    firstName: "Ravi",
    lastName: "Nair",
    location: "Thiruvananthapuram",
    status: "assigned",
    email: "ravi.nair@example.com",
    phoneNumber: "987-654-3210",
    gender: "Male",
    dob: "1985-05-15",
    salaryCap: 60000,
    hiringDate: "2018-05-15",
    experience: 8,
    rating: 4,
    reviews: [
      { id: "r3", text: "Good service.", date: "2020-03-10", rating: 4, reviewer: "Anjali Menon" }
    ],
    preferredLocations: ["Thiruvananthapuram"]
  },
  {
    _id: "3",
    firstName: "Lakshmi",
    lastName: "Pillai",
    location: "Kozhikode",
    status: "leave",
    email: "lakshmi.pillai@example.com",
    phoneNumber: "456-789-0123",
    gender: "Female",
    dob: "1992-03-10",
    salaryCap: 55000,
    hiringDate: "2019-03-10",
    experience: 3,
    rating: 4.2,
    reviews: [
      { id: "r4", text: "Very caring.", date: "2021-11-20", rating: 5, reviewer: "Ravi Nair" }
    ],
    preferredLocations: ["Kozhikode"]
  },
  {
    _id: "4",
    firstName: "Manu",
    lastName: "Varma",
    location: "Thrissur",
    status: "pending",
    email: "manu.varma@example.com",
    phoneNumber: "321-654-0987",
    gender: "Male",
    dob: "1980-07-20",
    salaryCap: 70000,
    hiringDate: "2010-07-20",
    experience: 10,
    rating: 3,
    reviews: [
      { id: "r5", text: "Average performance.", date: "2019-08-05", rating: 3, reviewer: "Lakshmi Pillai" }
    ],
    preferredLocations: ["Thrissur"]
  },
  {
    _id: "5",
    firstName: "Meera",
    lastName: "Das",
    location: "Kannur",
    status: "rejected",
    email: "meera.das@example.com",
    phoneNumber: "654-321-9876",
    gender: "Female",
    dob: "1988-11-30",
    salaryCap: 65000,
    hiringDate: "2015-11-30",
    experience: 7,
    rating: 4.6,
    reviews: [
      { id: "r6", text: "Excellent nurse!", date: "2020-12-12", rating: 5, reviewer: "Manu Varma" }
    ],
    preferredLocations: ["Kannur"]
  },
  {
    _id: "6",
    firstName: "Suresh",
    lastName: "Kumar",
    location: "Kochi",
    status: "under_review",
    email: "suresh.kumar@gmail.com",
    phoneNumber: "654-321-9876",
    gender: "Male",
    dob: "1988-11-30",
    salaryCap: 65000,
    hiringDate: "2015-11-30",
    experience: 7,
    rating: 2.6,
    reviews: [
      { id: "r7", text: "Needs improvement.", date: "2021-05-18", rating: 2, reviewer: "Meera Das" }
    ],
    preferredLocations: ["Kochi"]
  }
]

const filterOptions = [
  {
    value: "selectedLocation",
    setValue: "setSelectedLocation",
    options: [
      { value: "all", label: "All Locations" },
      { value: "Thiruvananthapuram", label: "Thiruvananthapuram" },
      { value: "Kollam", label: "Kollam" },
      { value: "Pathanamthitta", label: "Pathanamthitta" },
      { value: "Alappuzha", label: "Alappuzha" },
      { value: "Kottayam", label: "Kottayam" },
      { value: "Idukki", label: "Idukki" },
      { value: "Ernakulam", label: "Ernakulam" },
      { value: "Thrissur", label: "Thrissur" },
      { value: "Palakkad", label: "Palakkad" },
      { value: "Malappuram", label: "Malappuram" },
      { value: "Kozhikode", label: "Kozhikode" },
      { value: "Wayanad", label: "Wayanad" },
      { value: "Kannur", label: "Kannur" },
      { value: "Kasaragod", label: "Kasaragod" }
    ]
  },
  {
    value: "selectedStatus",
    setValue: "setSelectedStatus",
    options: [
      { value: "all", label: "All Status" },
      { value: "assigned", label: "Assigned" },
      { value: "leave", label: "Leave" },
      { value: "unassigned", label: "Unassigned" },
      { value: "pending", label: "Pending" },
      { value: "under_review", label: "Under Review" },
      { value: "rejected", label: "Rejected" }
    ]
  },
  {
    value: "selectedExperience",
    setValue: "setSelectedExperience",
    options: [
      { value: "all", label: "All Experience" },
      { value: "less_than_1", label: "< 1 year" },
      { value: "less_than_5", label: "< 5 years" },
      { value: "less_than_10", label: "< 10 years" },
      { value: "greater_than_15", label: ">= 10 years" }
    ]
  },
  {
    value: "selectedRating",
    setValue: "setSelectedRating",
    options: [
      { value: "all", label: "All Ratings" },
      { value: "1", label: "1 star or less" },
      { value: "2", label: "2 stars or less" },
      { value: "3", label: "3 stars or less" },
      { value: "4", label: "4 stars or less" },
      { value: "5", label: "5 stars or less" }
    ]
  }
]

const FilterSelect = ({ value, onChange, options, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[], className?: string }) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 ${className}`}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
)

export default function NursesPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedExperience, setSelectedExperience] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null)
  const [showAddNurse, setShowAddNurse] = useState(false)

  const filteredNurses = mockNurses.filter(nurse => {
    const matchesLocation = selectedLocation === "all" || nurse.preferredLocations.includes(selectedLocation)
    const matchesStatus = selectedStatus === "all" || nurse.status === selectedStatus
    const matchesExperience = selectedExperience === "all" || 
      (selectedExperience === "less_than_1" && (nurse.experience ?? 0) < 1) ||
      (selectedExperience === "less_than_5" && (nurse.experience ?? 0) < 5) ||
      (selectedExperience === "less_than_10" && (nurse.experience ?? 0) < 10) ||
      (selectedExperience === "greater_than_15" && (nurse.experience ?? 0) >= 10)
    const matchesRating = selectedRating === "all" || 
      (selectedRating === "1" && (nurse.rating ?? 0) <= 1) ||
      (selectedRating === "2" && (nurse.rating ?? 0) <= 2) ||
      (selectedRating === "3" && (nurse.rating ?? 0) <= 3) ||
      (selectedRating === "4" && (nurse.rating ?? 0) <= 4) ||
      (selectedRating === "5" && (nurse.rating ?? 0) <= 5)
    const matchesSearch = nurse.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nurse.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nurse.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLocation && matchesStatus && matchesExperience && matchesRating && matchesSearch
  })

  const handleReviewDetails = (nurse: Nurse) => {
    setSelectedNurse(nurse)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleAddNurse = (nurseData: any) => {
    // Handle adding new nurse here
    setShowAddNurse(false)
  }

  return (
    <div>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nurse Management</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddNurse(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Nurse
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search nurses..."
              className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Desktop view filters */}
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {filterOptions.map(({ value, setValue, options }) => (
                <FilterSelect 
                  key={value}
                  value={eval(value)} 
                  onChange={(e) => eval(setValue)(e.target.value)} 
                  options={options}
                />
              ))}
            </div>
          </div>
          {/* Mobile view select */}
          <div className="sm:hidden flex flex-col gap-2">
            {filterOptions.map(({ value, setValue, options }) => (
              <FilterSelect 
                key={value}
                value={eval(value)} 
                onChange={(e) => eval(setValue)(e.target.value)} 
                options={options}
                className="w-full"
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="hidden sm:block overflow-x-auto">
            <NurseTable nurses={filteredNurses} onReviewDetails={handleReviewDetails} />
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filteredNurses.map((nurse) => (
              <NurseCard key={nurse._id} nurse={nurse} onReviewDetails={handleReviewDetails} />
            ))}
          </div>
        </div>
      </div>
      {/* Add Nurse Overlay */}
      {showAddNurse && (
        <AddNurseOverlay 
          onClose={() => setShowAddNurse(false)}
          onAdd={handleAddNurse}
        />
      )}

      {/* Render the overlay when a nurse is selected */}
      {selectedNurse && (
        <NurseDetailsOverlay 
          nurse={selectedNurse} 
          onClose={() => setSelectedNurse(null)} 
        />
      )}
    </div>
  )
}
