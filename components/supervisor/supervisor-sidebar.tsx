"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  ClipboardList, 
  User, 
  ArrowLeftCircle,
  Settings,
  LogOut
} from "lucide-react";
import { AuthUser, logout } from "../../lib/auth";
import { useRouter } from "next/navigation";

interface SupervisorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

export default function SupervisorSidebar({ isOpen, onClose, user }: SupervisorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('supervisor-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);
  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/supervisor-dashboard" },
    { icon: Users, label: "My Students", href: "/supervisor-students" },
    { icon: ClipboardList, label: "Attendance", href: "/supervisor-attendance" },
    { icon: User, label: "Profile", href: "/supervisor-profile" },
    { icon: Settings, label: "Settings", href: "/supervisor-settings" }
  ];
  return (
    <div 
      id="supervisor-sidebar" 
      className={`w-56 h-screen bg-gradient-to-b from-slate-800 to-slate-900 fixed left-0 top-0 shadow-xl z-50 
        flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 border-b border-slate-700/50 flex items-center gap-2 p-3 bg-slate-800/50 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <Image src="/Academy menue bar.png" alt="Logo" width={130} height={35} className="mx-auto object-contain" />
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center hover:bg-slate-700/50 
              rounded-lg transition-all duration-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <ArrowLeftCircle className="w-5 h-5 text-slate-200" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name || 'Supervisor'}</p>
              <p className="text-xs text-slate-200 truncate">Supervisor</p>
            </div>
          </div>
        </div>        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                  }`}
                onClick={() => onClose()}
              >
                <div className={`transition-all duration-200 p-1.5 rounded-md 
                  ${isActive 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-indigo-500 rounded-r-full" />
                )}
              </Link>
            );          })}
        </nav>        {/* Logout Button */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={async () => {
              await logout();
              router.push('/signin');
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 w-full
              text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
          >
            <div className="p-1.5 rounded-md text-slate-400">
              <LogOut className="w-[18px] h-[18px]" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-300 text-center">
            Supervisor Portal v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
