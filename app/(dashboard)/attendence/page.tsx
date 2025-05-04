"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Student {
  id: number;
  name: string;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<{ [key: number]: boolean }>({});
  
  // Dummy student data - replace with actual data fetching
  const students: Student[] = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mike Johnson" },
  ];

  const toggleAttendance = (studentId: number) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Attendance</h1>
      <div className="space-y-4">
        {students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">{student.name}</span>
              <Button
                onClick={() => toggleAttendance(student.id)}
                variant={attendance[student.id] ? "success" : "destructive"}
              >
                {attendance[student.id] ? "Present" : "Absent"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
