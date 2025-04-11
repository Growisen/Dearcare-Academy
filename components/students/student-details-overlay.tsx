import React, { useState } from 'react';
import { X, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ClientInformation } from './studentInformation';
import { ConfirmedContent } from './ConfirmedContent';
import { FollowUpContent } from './FollowUp';
import { NewContent } from './NewContent';
import { RejectedContent } from './RejectedContent';
import { supabase } from '@/lib/supabase';

interface StudentDetailsProps {
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    course: string; 
    requestDate: string;
    location: string;
    dateOfBirth: string;
    age: string;
    gender: string;
    maritalStatus?: string;
    nationality?: string;
    state?: string;
    city?: string;
    taluk?: string;
    motherTongue?: string;
    knownLanguages?: string;
    religion?: string;
    category?: string;
    academics?: {
      sslc: { institution: string; year: string; grade: string };
      hsc: { institution: string; year: string; grade: string };
      gda: { institution: string; year: string; grade: string };
      others: { qualification: string; institution: string; year: string; grade: string };
    };
    organization?: string;
    role?: string;
    duration?: string;
    responsibilities?: string;
    guardianName?: string;
    guardianRelation?: string;
    guardianContact?: string;
    guardianAddress?: string;
    guardianAadhar?: string;
    healthStatus?: string;
    disability?: string;
    nocStatus?: string;
    sourceOfInformation?: string;
    assigningAgent?: string;
    status: "confirmed" | "follow-up" | "new" | "rejected"; // Make status required and strictly typed
    priority?: string;
    sourceCategory?: string;
    sourceSubCategory?: string;
    servicePreferences?: Record<string, string>;
    currentAddress?: string;
    currentPinCode?: string;
    permanentAddress?: string;
    permanentPinCode?: string;
    photo?: string;
    documents?: string;
    nocCertificate?: string;

  };
  onClose: () => void;
}

interface DialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmStyle?: string;
}

const ConfirmDialog = ({ title, message, confirmLabel, onConfirm, confirmStyle = 'bg-red-600 hover:bg-red-700', onClose }: DialogConfig & { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg ${confirmStyle}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  new: 'bg-blue-100 text-blue-800',
  'follow-up': 'bg-yellow-100 text-yellow-800',
};

export function StudentDetailsOverlay({ student, onClose }: StudentDetailsProps) {
  const [activeDialog, setActiveDialog] = useState<'delete' | 'proceed' | 'reject' | 'confirm-warning' | null>(null);
  const [currentStudent, setCurrentStudent] = useState(student);
  const status = currentStudent.status || 'new';

  const updateStudentStatus = async (newStatus: string) => {
    try {
      if (newStatus.toLowerCase() === 'confirmed') {
        // First, send verification email with receipt upload details
        const verifyResponse = await fetch('/api/verify-student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: student.id
          }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Failed to send verification email');
        }

        // Then send confirmation email
        const confirmResponse = await fetch('/api/mail/confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: student.name,
            email: student.email,
            courseName: student.course,
            id: student.id
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to send confirmation email');
        }
      }

      // Update status in database
      const { error } = await supabase
        .from('student_source')
        .update({ status: newStatus })
        .eq('student_id', student.id);

      if (error) throw error;
      
      // Update local state
      setCurrentStudent(prev => ({
        ...prev,
        status: newStatus.toLowerCase() as "confirmed" | "follow-up" | "new" | "rejected"
      }));
      
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const dialogConfigs: Record<NonNullable<typeof activeDialog>, DialogConfig> = {
    delete: {
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${student.name}'s record? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: () => {
        // TODO: Implement delete logic
        onClose();
      }
    },
    proceed: {
      title: 'Confirm Action',
      message: `Are you sure you want to proceed with ${student.name}'s application?`,
      confirmLabel: 'Proceed',
      confirmStyle: 'bg-green-600 hover:bg-green-700',
      onConfirm: () => setActiveDialog('confirm-warning')
    },
    reject: {
      title: 'Confirm Rejection',
      message: `Are you sure you want to reject ${student.name}'s application?`,
      confirmLabel: 'Reject',
      onConfirm: () => setActiveDialog(null)
    },
    'confirm-warning': {
      title: 'Warning: Irregular Confirmation',
      message: 'You are confirming this student without following the regular verification procedures. Are you sure you want to continue?',
      confirmLabel: 'Yes, Confirm Student',
      confirmStyle: 'bg-yellow-600 hover:bg-yellow-700',
      onConfirm: async () => {
        await updateStudentStatus('Confirmed');
        setActiveDialog(null);
      }
    }
  };

  // Extract state and city from location string
  const [city, state] = currentStudent.location?.split(', ') || [null, null];

  const transformedClientData = {
    ...currentStudent,
    // Basic info
    name: currentStudent.name,
    email: currentStudent.email,
    phone: currentStudent.phone,
    course: currentStudent.course,
    
    // Location info
    currentAddress: currentStudent.location,
    state: state || '',
    city: city || '',
    
    // Status and descriptions
    status: currentStudent.status,
    
    // Service preferences
    servicePreferences: {
      [currentStudent.service]: 'Interested'
    },

    // Required string fields with default values
    dateOfBirth: currentStudent.dateOfBirth || '',
    age: currentStudent.age || '',
    gender: currentStudent.gender || '',
    location: currentStudent.location || '',

    // Optional fields can be null or undefined
    maritalStatus: currentStudent.maritalStatus,
    nationality: currentStudent.nationality,
    taluk: currentStudent.taluk,
    motherTongue: currentStudent.motherTongue,
    knownLanguages: currentStudent.knownLanguages,
    religion: currentStudent.religion,
    category: currentStudent.category,
    academics: currentStudent.academics,
    organization: currentStudent.organization,
    role: currentStudent.role,
    duration: currentStudent.duration,
    responsibilities: currentStudent.responsibilities,
    guardianName: currentStudent.guardianName,
    guardianRelation: currentStudent.guardianRelation,
    guardianContact: currentStudent.guardianContact,
    guardianAddress: currentStudent.guardianAddress,
    guardianAadhar: currentStudent.guardianAadhar,
    disability: currentStudent.disability,
    nocStatus: currentStudent.nocStatus,
    sourceOfInformation: currentStudent.sourceOfInformation,
    assigningAgent: currentStudent.assigningAgent,
    priority: currentStudent.priority,
    sourceCategory: currentStudent.sourceCategory,
    sourceSubCategory: currentStudent.sourceSubCategory,
    photo: currentStudent.photo,
    documents: currentStudent.documents,
    nocCertificate: currentStudent.nocCertificate
  };

  const renderStatusSpecificContent = () => {
    switch (currentStudent.status) {
      case "confirmed":
        return <ConfirmedContent studentId={currentStudent.id}/>;
      case "follow-up":
        return <FollowUpContent studentId={currentStudent.id} />;
      case "new":
        return <NewContent studentId={currentStudent.id}/>;
      case "rejected":
        return <RejectedContent />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[80%] max-h-[95vh] overflow-y-auto rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
              <p className="text-sm text-gray-500">ID: {currentStudent.id}</p>
            </div>
            <div className="flex items-center gap-3">
              {!['confirmed', 'rejected'].includes(status) && ( // Use the status variable with default value
                <>
                  <button
                    onClick={() => setActiveDialog('reject')}
                    className="inline-flex items-center px-4 py-2 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition-colors gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => setActiveDialog('proceed')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Proceed
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 ml-4 border-l pl-4">
                <button onClick={() => setActiveDialog('delete')} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Delete">
                  <Trash2 className="h-5 w-5" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[status as keyof typeof STATUS_STYLES] || ''}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="px-6 py-4 space-y-6">
          <ClientInformation 
            studentId={currentStudent.id} 
            initialData={transformedClientData}
          />
          {renderStatusSpecificContent()}
        </div>
      </div>

      {activeDialog && (
        <ConfirmDialog
          {...dialogConfigs[activeDialog]}
          onClose={() => setActiveDialog(null)}
        />
      )}
    </div>
  );
}