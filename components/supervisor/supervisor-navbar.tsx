"use client";

import { Menu, LogOut, User, Bell } from "lucide-react";
import Image from "next/image";
import { AuthUser } from "../../lib/auth";

interface SupervisorNavbarProps {
  user: AuthUser;
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function SupervisorNavbar({ user, onMenuClick, onLogout }: SupervisorNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden lg:flex items-center space-x-3">
            <Image src="/logo2.png" alt="Logo" width={120} height={40} className="object-contain" />
            <span className="text-lg font-semibold text-gray-900">Supervisor Portal</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name || 'Supervisor'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
