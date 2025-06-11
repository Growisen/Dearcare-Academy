"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from 'react-hot-toast';

interface Student {
  id: number;
  name: string;
  register_no?: string;
}

interface StudentSource {
  student_id: number;
  students: {
    id: number;
    name: string;
    register_no?: string;
  } | null; // Ensure students can be null
}

interface AttendanceRecord {
  student_id: number;
  present: boolean;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<{ [key: number]: boolean | null }>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(false); // Track save status

  // Fetch students dynamically from the "students" and "student_source" tables
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);      const { data, error } = await supabase
        .from("student_source")
        .select(`
          student_id,
          students!student_source_student_id_fkey (id, name, register_no)
        `)
        .eq("status", "confirmed");

      //console.log("Fetched Data:", data);
      //console.log("Error:", error);

      if (error) {
        console.error("Error fetching students:", error);
      } else if (data) {        // Ensure students is not null and map correctly
        const studentData = data as unknown as StudentSource[];
        const mappedStudents = studentData
          .filter((entry) => entry.students !== null) // Exclude rows where students is null
          .map((entry) => ({
            id: entry.students!.id, // Use non-null assertion
            name: entry.students!.name,
            register_no: entry.students!.register_no,
          }));
        setStudents(mappedStudents);

        // Initialize attendance state for all students
        const initialAttendance: { [key: number]: boolean | null } = {};
        mappedStudents.forEach((student) => {
          initialAttendance[student.id] = null; // Null indicates no selection yet
        });
        setAttendance(initialAttendance);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  // Fetch saved attendance for the selected date
  useEffect(() => {
    const fetchSavedAttendance = async () => {
      const { data, error } = await supabase
        .from("academy_student_attendance")
        .select("student_id, present")
        .eq("date", date);

      if (error) {
        console.error("Error fetching saved attendance:", error);
      } else if (data && data.length > 0) {
        const savedAttendance = (data as AttendanceRecord[]).reduce(
          (acc, record) => ({
            ...acc,
            [record.student_id]: record.present,
          }),
          {}
        );
        setAttendance(savedAttendance); // Update attendance state with saved data
        setSaveStatus(true); // Mark save status as true since attendance exists
      } else {
        // Reset attendance state if no saved data exists
        const initialAttendance: { [key: number]: boolean | null } = {};
        students.forEach((student) => {
          initialAttendance[student.id] = null;
        });
        setAttendance(initialAttendance);
        setSaveStatus(false); // Mark save status as false
      }
    };

    fetchSavedAttendance();
  }, [date, students]);

  const toggleAttendance = (studentId: number, isPresent: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };

  const saveAttendance = async () => {
    // Map attendance state to create attendance entries
    const attendanceEntries = Object.entries(attendance)
      .filter(([, isPresent]) => isPresent !== null) // Only save rows with valid attendance
      .map(([studentId, isPresent]) => ({
        student_id: parseInt(studentId, 10), // Use student_id as a foreign key
        date, // Use the selected date
        present: isPresent, // Use the attendance state (true for Present, false for Absent)
      }));    // If no attendance data is available, show a toast
    if (attendanceEntries.length === 0) {
      toast.error("No attendance data to save.");
      return;
    }

    // Insert attendance data into the "academy_student_attendance" table
    const { error } = await supabase
      .from("academy_student_attendance")
      .insert(attendanceEntries);    // Handle errors or success
    if (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
    } else {
      setSaveStatus(true); // Update save status to true
      toast.success("Attendance saved successfully!");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Attendance</h1>
      <div className="mb-6 flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </div>
        {saveStatus && (
          <p className="text-green-600 font-medium">Attendance saved successfully!</p>
        )}
      </div>
      {loading ? (
        <p className="text-gray-500">Loading students...</p>
      ) : (
        <div className="space-y-4">
          {students.length > 0 ? (
            students.map((student) => (
              <Card
                key={student.id}
                className={`p-4 ${
                  attendance[student.id] === true
                    ? "bg-green-100"
                    : attendance[student.id] === false
                    ? "bg-red-100"
                    : ""
                }`}              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg">{student.name}</span>
                    {student.register_no && (
                      <div className="text-sm text-gray-500">({student.register_no})</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleAttendance(student.id, true)}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      Present
                    </Button>
                    <Button
                      onClick={() => toggleAttendance(student.id, false)}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Absent
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500">No students found with status &quot;Confirmed&quot;.</p>
          )}
        </div>
      )}
      <div className="mt-6">
        {!saveStatus && (
          <Button
            onClick={saveAttendance}
            className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-2 rounded-md"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
