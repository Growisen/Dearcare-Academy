import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { AssignStudentOverlay } from './assign-student-overlay';
import { StudentFormData, SupervisorDetailsProps } from '../../types/supervisors.types';

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

export function SupervisorDetailsOverlay({ supervisor, onClose }: SupervisorDetailsProps) {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const allStudents = supervisor.faculties.flatMap(f => 
    f.students.map(name => ({ name, subject: f.subject }))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
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
                onClick={() => setShowAssignForm(true)}
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
      
      {showAssignForm && (
        <AssignStudentOverlay
          supervisorId={supervisor.id}
          onClose={() => setShowAssignForm(false)}
          onAssign={(data: StudentFormData) => {
            console.log('Student assigned:', data);
            setShowAssignForm(false);
          }}
        />
      )}
    </div>
  );
}
