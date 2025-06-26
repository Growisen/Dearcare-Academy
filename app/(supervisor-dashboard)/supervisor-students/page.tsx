"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { Users, BookOpen } from "lucide-react";

interface AssignedStudent {
  id: number;
  name: string;
  course: string;
  register_no: string;
  email: string;
  mobile: string;
}



export default function SupervisorStudents() {
  const [loading, setLoading] = useState(true);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<AssignedStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      const currentUser = getUserSession();
      if (currentUser) {
        await fetchAssignedStudents(currentUser.id);
      } else {
        setError('User session not found. Please sign in again.');
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const fetchAssignedStudents = async (supervisorId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('supervisor_assignment')
        .select(`
          student_id,
          students!supervisor_assignment_student_id_fkey (
            id,
            name,
            course,
            register_no,
            email,
            mobile
          )
        `)
        .eq('supervisor_id', supervisorId);

      if (error) throw error;

      // Process the data correctly - students is not an array, it's a single object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const students = data?.map((assignment: any) => {
        const student = assignment.students;
        return {
          id: student?.id || 0,
          name: student?.name || '',
          course: student?.course || '',
          register_no: student?.register_no || '',
          email: student?.email || '',
          mobile: student?.mobile || ''
        };
      }).filter((student: AssignedStudent) => student.id > 0) || []; // Filter out invalid students

      setAssignedStudents(students);
      setFilteredStudents(students);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      setError('Failed to load assigned students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = assignedStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.register_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [assignedStudents, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading your students...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <div className="text-sm text-gray-500">
          Total Students: {assignedStudents.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, register no, course, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <div key={`student-${student.id}-${index}-${student.register_no || student.email || 'unknown'}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.register_no}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>{student.course}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-4 h-4 mr-2">📧</span>
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-4 h-4 mr-2">📱</span>
                <span>{student.mobile}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {assignedStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Assigned</h3>
          <p className="text-gray-500">You don&apos;t have any students assigned to you yet.</p>
        </div>
      )}
    </div>
  );
}