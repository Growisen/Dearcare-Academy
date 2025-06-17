"use client"
import Navbar from "../../components/navbar"
import Sidebar from "../../components/sidebar"
import ProtectedRoute from "../../components/ProtectedRoute"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-[#ebf4f5] to-[#f7f5fa]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ebf4f5]/50 via-transparent to-[#f7f5fa]/50 pointer-events-none" />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />        <div className={`h-full relative lg:pl-56 transition-all duration-300 ${isSidebarOpen ? 'lg:filter-none lg:blur-sm' : ''}`}>
          <Navbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pt-24 pb-5">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
