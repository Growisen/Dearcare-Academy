"use client"
import { useState, useEffect } from "react"
import FacultyAttendance from "../../../components/dashboard/FacultyAttendance"
import RecentActivities from "../../../components/dashboard/RecentActivities"
import Stats from "../../../components/dashboard/Stats"
import UpcomingSchedules from "../../../components/dashboard/UpcomingSchedules"
import RecentStudents from "../../../components/dashboard/RecentStudents"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 xl:gap-8 min-h-screen">
      {/* Left Section */}
      <div className="xl:col-span-9 flex flex-col gap-4 md:gap-6">
        <div className="flex-1 space-y-4 md:space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Stats />
          </div>

          {/* Middle Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-sm">
              <FacultyAttendance currentTime={currentTime} />
            </div>
            <div className="bg-white rounded-xl shadow-sm">
              <RecentActivities />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bg-white rounded-xl shadow-sm">
            <RecentStudents />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="xl:col-span-3">
        <div className="sticky top-0">
          <UpcomingSchedules />
        </div>
      </div>
    </div>
  )
}