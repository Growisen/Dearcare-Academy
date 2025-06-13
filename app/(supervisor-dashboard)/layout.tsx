"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession, AuthUser } from "../../lib/auth";
import SupervisorSidebar from "../../components/supervisor/supervisor-sidebar";
import SupervisorNavbar from "../../components/supervisor/supervisor-navbar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function SupervisorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser && currentUser.role === 'supervisor') {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    clearUserSession();
    router.push('/signin');
  };

  return (
    <ProtectedRoute allowedRoles={['supervisor']}>
      <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-[#ebf4f5] to-[#f7f5fa]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ebf4f5]/50 via-transparent to-[#f7f5fa]/50 pointer-events-none" />
        
        {user && (
          <>
            <SupervisorSidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
              user={user}
            />            <div className={`h-full relative lg:pl-56 transition-all duration-300 ${
              sidebarOpen ? 'lg:filter-none lg:blur-sm' : ''
            }`}>
              <SupervisorNavbar 
                user={user}
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
              />
              <main className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pt-24 pb-5">
                {children}
              </main>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}