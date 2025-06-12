"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'class' | 'meeting' | 'evaluation' | 'other';
  students?: string[];
}

export default function SupervisorSchedule() {  const [loading, setLoading] = useState(true);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      fetchSchedule();
    }
    setLoading(false);
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSchedule = async () => {
    // Mock data for demonstration
    const mockSchedule: ScheduleItem[] = [
      {
        id: 1,
        title: "Student Evaluation Session",
        date: selectedDate,
        time: "09:00 AM",
        location: "Room 201",
        type: "evaluation",
        students: ["John Doe", "Jane Smith"]
      },
      {
        id: 2,
        title: "Team Meeting",
        date: selectedDate,
        time: "02:00 PM",
        location: "Conference Room",
        type: "meeting"
      },
      {
        id: 3,
        title: "Practical Training Session",
        date: selectedDate,
        time: "04:00 PM",
        location: "Training Lab",
        type: "class",
        students: ["Alice Johnson", "Bob Wilson", "Carol Davis"]
      }
    ];

    setScheduleItems(mockSchedule);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'evaluation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return '📚';
      case 'meeting': return '👥';
      case 'evaluation': return '📋';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Schedule Items */}
      <div className="space-y-4">
        {scheduleItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getTypeIcon(item.type)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.location}</span>
                  </div>
                  {item.students && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.students.length} student{item.students.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {item.students && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Students:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.students.map((student, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                        >
                          {student}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {scheduleItems.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Items</h3>
          <p className="text-gray-500">You don&apos;t have any scheduled items for this date.</p>
        </div>
      )}
    </div>
  );
}
