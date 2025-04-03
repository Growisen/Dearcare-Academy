import React, { useState } from 'react';
import { X, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ClientInformation } from './studentInformation';
import { ConfirmedContent } from './ConfirmedContent';
import { FollowUpContent } from './FollowUp';
import { NewContent } from './NewContent';
import { RejectedContent } from './RejectedContent';

interface StudentDetailsProps {
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
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
  const [activeDialog, setActiveDialog] = useState<'delete' | 'proceed' | 'reject' | null>(null);
  const status = student.status || 'new'; // Provide default value if needed, though type makes it unnecessary

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
      onConfirm: () => setActiveDialog(null)
    },
    reject: {
      title: 'Confirm Rejection',
      message: `Are you sure you want to reject ${student.name}'s application?`,
      confirmLabel: 'Reject',
      onConfirm: () => setActiveDialog(null)
    }
  };

  // Extract state and city from location string
  const [city, state] = student.location?.split(', ') || [null, null];

  const transformedClientData = {
    ...student,
    // Basic info
    name: student.name,
    email: student.email,
    phone: student.phone,
    service: student.service,
    
    // Location info
    currentAddress: student.location,
    state: state || '',
    city: city || '',
    
    // Status and descriptions
    status: student.status,
    
    // Service preferences
    servicePreferences: {
      [student.service]: 'Interested'
    },

    // Required string fields with default values
    dateOfBirth: student.dateOfBirth || '',
    age: student.age || '',
    gender: student.gender || '',
    location: student.location || '',

    // Optional fields can be null or undefined
    maritalStatus: student.maritalStatus,
    nationality: student.nationality,
    taluk: student.taluk,
    motherTongue: student.motherTongue,
    knownLanguages: student.knownLanguages,
    religion: student.religion,
    category: student.category,
    academics: student.academics,
    organization: student.organization,
    role: student.role,
    duration: student.duration,
    responsibilities: student.responsibilities,
    guardianName: student.guardianName,
    guardianRelation: student.guardianRelation,
    guardianContact: student.guardianContact,
    guardianAddress: student.guardianAddress,
    guardianAadhar: student.guardianAadhar,
    disability: student.disability,
    nocStatus: student.nocStatus,
    sourceOfInformation: student.sourceOfInformation,
    assigningAgent: student.assigningAgent,
    priority: student.priority,
    sourceCategory: student.sourceCategory,
    sourceSubCategory: student.sourceSubCategory,
    photo: student.photo,
    documents: student.documents,
    nocCertificate: student.nocCertificate
  };

  const renderStatusSpecificContent = () => {
    switch (student.status) {
      case "confirmed":
        return <ConfirmedContent />;
      case "follow-up":
        return <FollowUpContent />;
      case "new":
        return <NewContent />;
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
              <p className="text-sm text-gray-500">ID: {student.id}</p>
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
            studentId={student.id} 
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