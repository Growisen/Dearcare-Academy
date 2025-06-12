"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle } from "lucide-react";

interface ScheduleItem {
  id: number;
  title: string;
  type: 'class' | 'exam' | 'assignment' | 'event';
  date: string;
  time: string;
  duration: string;
  location: string;
  instructor: string;
  description?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const mockSchedule: ScheduleItem[] = [
  {
    id: 1,
    title: "Anatomy and Physiology",
    type: "class",
    date: "2025-06-12",
    time: "09:00 AM",
    duration: "2 hours",
    location: "Room 101",
    instructor: "Dr. Smith",
    description: "Human Body Systems",
    status: "upcoming"
  },
  {
    id: 2,
    title: "Practical Training",
    type: "class",
    date: "2025-06-12",
    time: "02:00 PM",
    duration: "3 hours",
    location: "Training Lab",
    instructor: "Nurse Johnson",
    description: "Patient Care Techniques",
    status: "upcoming"
  },
  {
    id: 3,
    title: "Mid-term Examination",
    type: "exam",
    date: "2025-06-15",
    time: "10:00 AM",
    duration: "3 hours",
    location: "Exam Hall",
    instructor: "Multiple",
    description: "Comprehensive nursing exam covering all modules",
    status: "upcoming"
  },
  {
    id: 4,
    title: "Case Study Assignment",
    type: "assignment",
    date: "2025-06-18",
    time: "11:59 PM",
    duration: "",
    location: "Online Submission",
    instructor: "Dr. Williams",
    description: "Submit detailed patient care analysis",
    status: "upcoming"
  }
];

export default function StudentSchedule() {
  const [loading, setLoading] = useState(true);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      // In a real app, this would fetch from the database
      setScheduleItems(mockSchedule);
    }
    setLoading(false);
  }, [selectedDate]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exam': return 'bg-red-100 text-red-800 border-red-200';
      case 'assignment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return '📚';
      case 'exam': return '📝';
      case 'assignment': return '📋';
      case 'event': return '🎉';
      default: return '📅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600';
      case 'ongoing': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredSchedule = scheduleItems.filter(item => {
    const itemDate = new Date(item.date);
    const selected = new Date(selectedDate);
    
    switch (viewMode) {
      case 'day':
        return itemDate.toDateString() === selected.toDateString();
      case 'week':
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - selected.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return itemDate >= weekStart && itemDate <= weekEnd;
      case 'month':
        return itemDate.getMonth() === selected.getMonth() && 
               itemDate.getFullYear() === selected.getFullYear();
      default:
        return true;
    }
  });

  const upcomingItems = scheduleItems.filter(item => 
    new Date(item.date) >= new Date() && item.status === 'upcoming'
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Classes</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredSchedule.filter(item => item.type === 'class').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-xl font-bold text-gray-900">
                {scheduleItems.filter(item => item.type === 'exam' && item.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assignments Due</p>
              <p className="text-xl font-bold text-gray-900">
                {scheduleItems.filter(item => item.type === 'assignment' && item.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredSchedule.filter(item => item.type === 'class').length * 2}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Schedule for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredSchedule.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getTypeIcon(item.type)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{item.time} {item.duration && `(${item.duration})`}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{item.instructor}</span>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-700">{item.description}</p>
                      )}
                      
                      <div className="mt-2">
                        <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSchedule.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Items</h3>
                <p className="text-gray-500">No items scheduled for the selected period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Items Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
            
            <div className="space-y-3">
              {upcomingItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg">{getTypeIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString()} at {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {upcomingItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming items</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View Full Calendar
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Download Schedule
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Set Reminders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}