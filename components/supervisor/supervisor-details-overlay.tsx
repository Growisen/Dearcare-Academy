import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { SupervisorDetailsProps } from '../../types/supervisors.types';

const SUPERVISOR_FIELDS = [
  ['Name', 'name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Department', 'department'],
  ['Join Date', 'joinDate'],
  ['Status', (s: any) => s.status.replace('_', ' ')]
] as const;

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-gray-50">
      {value}
    </div>
  </div>
);

// Add this mock data for available students
const AVAILABLE_STUDENTS = [
  { id: '1', name: 'John Doe', course: 'Emergency Care' },
  { id: '2', name: 'Jane Smith', course: 'Geriatric Care' },
  { id: '3', name: 'Mike Johnson', course: 'Palliative Care' },
  { id: '4', name: 'Sarah Williams', course: 'Critical Care' },
  { id: '5', name: 'Tom Brown', course: 'Home Care' },
];

export function SupervisorDetailsOverlay({ supervisor, onClose }: SupervisorDetailsProps) {
  const [showAssignList, setShowAssignList] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const allStudents = supervisor.faculties.flatMap(f => 
    f.students.map(name => ({ name, subject: f.subject }))
  );

  const handleAssignStudents = () => {
    // Handle the assignment logic here
    console.log('Assigning students:', selectedStudents);
    setShowAssignList(false);
    setSelectedStudents([]);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      {showAssignList ? (
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Students</h2>
              <p className="text-sm text-gray-500">{selectedStudents.length} students selected</p>
            </div>
            <button onClick={() => setShowAssignList(false)} className="p-2 hover:bg-gray-50 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {AVAILABLE_STUDENTS.map((student) => (
                <div
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors
                    ${selectedStudents.includes(student.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                    }`}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.course}</p>
                  </div>
                  {selectedStudents.includes(student.id) && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
            <button
              onClick={handleAssignStudents}
              disabled={selectedStudents.length === 0}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Assign Selected Students
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Supervisor Details</h2>
              <p className="text-sm text-gray-500">ID: {supervisor.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUPERVISOR_FIELDS.map(([label, key]) => (
                <InfoField 
                  key={label} 
                  label={label} 
                  value={typeof key === 'function' ? key(supervisor) : supervisor[key as keyof typeof supervisor]} 
                />
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Students</h3>
                  <p className="text-sm text-gray-500">Total {allStudents.length} students</p>
                </div>
                <button 
                  onClick={() => setShowAssignList(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <UserPlus className="h-4 w-4" />Assign Student
                </button>
              </div>

              <div className="grid gap-2 max-h-[40vh] overflow-y-auto pr-2">
                {allStudents.map(({ name, subject }, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium text-gray-900">{name}</h4>
                      <p className="text-xs text-gray-500">{subject}</p>
                    </div>
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
