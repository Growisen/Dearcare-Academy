"use client"
import { Bell, Search, User, Menu} from "lucide-react"
//import Image from "next/image"
import { Input } from "./ui/input"

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="h-16 border-b border-slate-200 fixed top-0 right-0 bg-white/80 backdrop-blur-md z-20 
      lg:left-56 left-0 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="relative min-w-[200px] max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-500">Admin</p>
              {/* <p className="text-xs text-slate-500">Principal</p> */}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
