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

interface SupervisorAssignmentData {
  student_id: number;
  students: {
    id: number;
    name: string;
    course: string;
    register_no: string;
    email: string;
    mobile: string;
  }[];
}

export default function SupervisorStudents() {
  const [loading, setLoading] = useState(true);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      fetchAssignedStudents(currentUser.id);
    }
    setLoading(false);  }, []);

  const fetchAssignedStudents = async (supervisorId: number) => {
    try {
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
        .eq('supervisor_id', supervisorId);      if (error) throw error;      const students = data.map((assignment: SupervisorAssignmentData) => ({
        id: assignment.students[0]?.id || 0,
        name: assignment.students[0]?.name || '',
        course: assignment.students[0]?.course || '',
        register_no: assignment.students[0]?.register_no || '',
        email: assignment.students[0]?.email || '',
        mobile: assignment.students[0]?.mobile || ''
      }));

      setAssignedStudents(students);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <div className="text-sm text-gray-500">
          Total Students: {assignedStudents.length}
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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