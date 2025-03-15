import { Card } from "../ui/card"
import { Activity } from "lucide-react"

interface ActivityItem {
  id: number;
  title: string;
  time: string;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    title: "Home Care Fundamentals Workshop Registration Open",
    time: "1 hour ago"
  },
  {
    id: 2,
    title: "Sr. Martha Williams joined Geriatric Care Faculty",
    time: "3 hours ago"
  },
  {
    id: 3,
    title: "Placement Drive - HomeHealth Solutions",
    time: "5 hours ago"
  },
  {
    id: 4,
    title: "Practical Assessment Schedule for Elder Care Module",
    time: "1 day ago"
  }
]

export default function RecentActivities() {
  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl h-[290px] col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#2C3E50]/10">
            <Activity className="w-5 h-5 text-[#2C3E50]" />
          </div>
          <h3 className="text-md font-semibold text-[#2C3E50]">Recent Activities</h3>
        </div>
      </div>

      <div className="space-y-4 pr-2 overflow-y-auto custom-scrollbar h-[210px]">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#2C3E50] mt-1.5" />
            <div>
              <p className="text-sm text-[#2C3E50] font-medium">{activity.title}</p>
              <p className="text-xs text-[#34495E] mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
