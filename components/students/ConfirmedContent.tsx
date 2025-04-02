import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  instructor: string;
}

const DUMMY_COURSES = [
  {
    id: "1",
    name: "Basic Life Support (BLS) Certification",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    description: "Essential life support techniques and emergency response for healthcare providers",
    instructor: "Dr. Sarah Thompson, RN"
  },
  {
    id: "2",
    name: "Advanced Patient Care Techniques",
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    description: "Advanced nursing procedures and patient care methodologies",
    instructor: "Prof. Michael Chen, DNP"
  }
];

const CourseCard = ({ 
  course, 
  onUnenroll 
}: { 
  course: Course; 
  onUnenroll: (courseId: string) => void;
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{course.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {course.startDate} - {course.endDate}
          </p>
          <p className="text-sm text-gray-600 mt-2">{course.description}</p>
          <p className="text-sm text-gray-500 mt-1">Instructor: {course.instructor}</p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Unenroll
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirm Unenrollment</h3>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unenroll from {course.name}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUnenroll(course.id);
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Unenroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function ConfirmedContent() {
  const handleUnenroll = async (courseId: string) => {
    console.log('Unenrolling from course:', courseId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses</h2>
      </div>

      {DUMMY_COURSES.length > 0 ? (
        <div className="space-y-4">
          {DUMMY_COURSES.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onUnenroll={handleUnenroll}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Registration Confirmed
          </h3>
          <p className="text-gray-600">
            You're all set! Ready to enroll in courses.
          </p>
        </div>
      )}
    </div>
  );
}

export default ConfirmedContent;