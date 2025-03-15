import { Card } from "../ui/card"
import { Calendar, GraduationCap, Users, BookOpen, Presentation, LucideIcon } from "lucide-react"

interface Schedule {
  text: string;
  time: string;
  location: string;
  urgent?: boolean;
  icon: LucideIcon;
}

const schedules: Schedule[] = [
    { 
      text: "Faculty Meeting - Semester Planning", 
      time: "2:00 PM", 
      location: "Conference Hall A", 
      urgent: true,
      icon: Users 
    },
    { 
      text: "Final Year Project Presentations", 
      time: "4:30 PM", 
      location: "Auditorium", 
      icon: Presentation
    },
    { 
      text: "New Student Orientation", 
      time: "Tomorrow, 10 AM", 
      location: "Main Hall",
      icon: GraduationCap 
    },
    { 
      text: "Computer Science Workshop", 
      time: "Friday", 
      location: "Lab 101",
      icon: BookOpen 
    },
    { 
      text: "Department Heads Meeting", 
      time: "Next Monday, 2 PM", 
      location: "Board Room",
      urgent: true,
      icon: Users 
    },
    { 
      text: "AI & ML Workshop", 
      time: "Next Tuesday", 
      location: "Computer Lab 2",
      icon: BookOpen 
    },
    { 
      text: "Campus Recruitment Drive", 
      time: "Next Week", 
      location: "Placement Cell",
      icon: GraduationCap 
    },
    { 
      text: "Research Symposium", 
      time: "15th Dec", 
      location: "Conference Center",
      icon: Presentation 
    }
]

export default function UpcomingSchedules() {
  return (
    <Card className="h-[calc(100vh-7.3rem)] bg-white/50 border border-gray-100/20 rounded-xl">
      <div className="flex flex-col h-full pb-3">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100/20">
          <div className="p-2 rounded-lg bg-[#2C3E50]/10">
            <Calendar className="w-5 h-5 text-[#2C3E50]" />
          </div>
          <h3 className="text-md font-semibold text-[#2C3E50]">Upcoming Schedules</h3>
        </div>
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {schedules.map((schedule, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#ECF0F1] hover:bg-[#ECF0F1]/70 transition-colors border border-[#2C3E50]/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2C3E50]/10 flex items-center justify-center text-[#2C3E50] flex-shrink-0">
                    <schedule.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C3E50] text-sm font-medium flex items-center gap-2">
                      {schedule.text}
                      {schedule.urgent && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#E74C3C]/10 text-[#E74C3C] text-xs">
                          Urgent
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#34495E] ml-11">
                  <span>{schedule.time}</span>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{schedule.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
