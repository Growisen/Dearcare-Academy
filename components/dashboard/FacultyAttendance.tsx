import { Card } from "../ui/card"
import { GraduationCap, UserCheck, UserX, Calendar } from "lucide-react"

interface FacultyAttendanceProps {
  currentTime: string;
}

export default function FacultyAttendance({ currentTime }: FacultyAttendanceProps) {
  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl h-[290px] col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-[#2C3E50]/10">
            <GraduationCap className="w-5 h-5 text-[#2C3E50]" />
          </div>
          <div>
            <h3 className="text-md font-semibold text-[#2C3E50]">Faculty Attendance</h3>
            <p className="text-xs text-[#34495E] mt-1">{currentTime}</p>
          </div>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 mr-1">Details        </button>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-[#ECF0F1]" strokeWidth="6" stroke="currentColor" fill="transparent" r="45" cx="48" cy="48" />
            <circle 
              className="text-[#27AE60]" 
              strokeWidth="6" 
              strokeDasharray={283} 
              strokeDashoffset={283 * (1 - 0.92)} 
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="transparent" 
              r="45" 
              cx="48" 
              cy="48" 
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-lg font-bold text-[#2C3E50]">92%</p>
            <p className="text-xs text-[#34495E]">Present</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between p-3 bg-[#27AE60]/10 rounded-lg">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#27AE60]" />
              <span className="text-sm text-[#2C3E50]">Present</span>
            </div>
            <span className="font-semibold text-[#27AE60]">42</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#E74C3C]/10 rounded-lg">
            <div className="flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-[#E74C3C]" />
              <span className="text-sm text-[#2C3E50]">Absent</span>
            </div>
            <span className="font-semibold text-[#E74C3C]">2</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#2C3E50]/10 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2C3E50]" />
              <span className="text-sm text-[#2C3E50]">On Leave</span>
            </div>
            <span className="font-semibold text-[#2C3E50]">1</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
