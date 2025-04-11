import { Card } from "../ui/card"
import { CountUp } from "use-count-up"
import { Users, GraduationCap, BookOpen, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/lib/supabase"

interface Stat {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
  iconColor: string;
}

import { LucideIcon } from "lucide-react";

export default function Stats() {
  const [statsData, setStatsData] = useState({
    facultyCount: 0,
    studentCount: 0,
    courseCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await getDashboardStats();
      if (!error && data) {
        setStatsData(data);
      }
    };
    fetchStats();
  }, []);

  const stats: Stat[] = [
    { 
      title: "Active Faculty", 
      value: statsData.facultyCount, 
      icon: Users, 
      //trend: "+0%", 
      //trendUp: true, 
      bgColor: "bg-[#2C3E50]/10", 
      iconColor: "text-[#2C3E50]" 
    },
    { 
      title: "Total Students", 
      value: statsData.studentCount, 
      icon: GraduationCap, 
      trend: "+12%", 
      trendUp: true, 
      bgColor: "bg-[#E74C3C]/10", 
      iconColor: "text-[#E74C3C]" 
    },
    { 
      title: "Active Courses", 
      value: statsData.courseCount, 
      icon: BookOpen, 
      trend: "+2%", 
      trendUp: true, 
      bgColor: "bg-[#27AE60]/10", 
      iconColor: "text-[#27AE60]" 
    },
    { 
      title: "Achievements", 
      value: 156, 
      icon: Trophy, 
      trend: "+8%", 
      trendUp: true, 
      bgColor: "bg-[#F39C12]/10", 
      iconColor: "text-[#F39C12]" 
    },
  ]

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 group hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border border-gray-100/20 hover:border-gray-200/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-medium text-gray-600">{stat.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  <CountUp isCounting end={stat.value} duration={2} />
                </span>
                {/*
                <span className={`text-xs flex items-center gap-0.5 ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                  {stat.trend}
                </span>
                */}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}
