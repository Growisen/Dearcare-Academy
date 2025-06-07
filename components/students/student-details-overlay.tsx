 import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
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
    register_no?: string;
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
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  confirmStyle?: string;
}

const ConfirmDialog = ({ title, message, confirmLabel, onConfirm, confirmStyle = 'bg-red-600 hover:bg-red-700', onClose }: DialogConfig & { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="text-gray-600 mb-6">{message}</div>
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
  const [activeDialog, setActiveDialog] = useState<'delete' | 'proceed' | 'reject' | 'confirm-warning' | 'reject-warning' | null>(null);
  const [currentStudent, setCurrentStudent] = useState(student);
  const [rejectionReason, setRejectionReason] = useState(''); // State for rejection reason
  // const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  // const [nocUrl, setNocUrl] = useState<string | null>(null);
  const status = currentStudent.status || 'new';

  // useEffect(() => {
  //   if (!student.id) return;

    // photo.jpg
  //   const { data: photoData } = supabase
  //     .storage
  //     .from('dearcare')
  //     .getPublicUrl(`Students/${student.id}/photo.jpg`);
  //   setPhotoUrl(photoData?.publicUrl || null);

  //   // documents.pdf
  //   const { data: docData } = supabase
  //     .storage
  //     .from('dearcare')
  //     .getPublicUrl(`Students/${student.id}/documents.pdf`);
  //   setDocumentUrl(docData?.publicUrl || null);

  //   // noc.pdf
  //   const { data: nocData } = supabase
  //     .storage
  //     .from('dearcare')
  //     .getPublicUrl(`Students/${student.id}/noc.pdf`);
  //   setNocUrl(nocData?.publicUrl || null);
  // }, [student.id]);

  const updateStudentStatus = async (newStatus: string) => {
    try {
      //confirmed part
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




      if (newStatus.toLowerCase() === 'rejected') {
        console.log('Inserting rejection reason into "academy_rejects" table...');
        const { error: rejectionError } = await supabase
          .from('academy_rejects')
          .insert({
            student_id: student.id,
            reason: rejectionReason.trim(),
          });

        if (rejectionError) {
          console.error('Error inserting rejection reason:', rejectionError);
          throw rejectionError;
        }
      }

      // 1. Check if a row exists for this student_id
      const { data: existingRows, error: selectError } = await supabase
        .from('student_source')
        .select('student_id')
        .eq('student_id', Number(student.id));

      if (selectError) {
        console.error('Error checking for existing student_source row:', selectError);
        throw selectError;
      }

      if (existingRows && existingRows.length > 0) {
        // 2. Row exists: update status
        const { error: updateError } = await supabase
          .from('student_source')
          .update({ status: newStatus })
          .eq('student_id', Number(student.id));

        if (updateError) {
          console.error('Error updating status in "student_source":', updateError);
          throw updateError;
        }
      } else {
        // 3. Row does not exist: insert new row
        const { error: insertError } = await supabase
          .from('student_source')
          .insert([{ student_id: Number(student.id), status: newStatus }]);

        if (insertError) {
          console.error('Error inserting new row in "student_source":', insertError);
          throw insertError;
        }
      }

      console.log('Successfully updated status. Updating local state...');
      setCurrentStudent((prev) => ({
        ...prev,
        status: newStatus.toLowerCase() as 'confirmed' | 'follow-up' | 'new' | 'rejected',
      }));

      //new addition upto catch

    } catch (error) {
      console.error('Unhandled error in updateStudentStatus:', error);
      alert('An error occurred while updating the student status. Please try again.');
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
      message: (
        <div>
          <p>Please provide a reason for rejecting {student.name}&apos;s application:</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason here..."
            className="w-full mt-2 p-2 border rounded-lg"
          />
        </div>
      ),
      confirmLabel: 'Proceed with Rejection',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => {
        if (!rejectionReason.trim()) {
          alert('Rejection reason cannot be empty.');
          return;
        }
        setActiveDialog('reject-warning');
      },
    },
    'reject-warning': {
      title: 'Final Rejection Warning',
      message: 'This action will permanently reject the student application. Are you sure you want to continue?',
      confirmLabel: 'Yes, Reject Application',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        await updateStudentStatus('rejected');
        setActiveDialog(null);
      }
    },
    'confirm-warning': {
      title: 'Warning: Irregular Confirmation',
      message: 'You are confirming this student without following the regular verification procedures. Are you sure you want to continue?',
      confirmLabel: 'Yes, Confirm Student',
      confirmStyle: 'bg-yellow-600 hover:bg-yellow-700',
      onConfirm: async () => {
        await updateStudentStatus('confirmed');
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
    register_no: currentStudent.register_no,
    
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
        return <RejectedContent studentId={currentStudent.id}/>;
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
                {/*
                <button onClick={() => setActiveDialog('delete')} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Delete">
                  <Trash2 className="h-5 w-5" />
                </button>
                */}
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
          <div className="space-y-4">
            {/* Photo Section */}
            {/* <div>
              <h4 className="font-semibold mb-2">Photo</h4>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Student Photo"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              ) : (
                <span className="text-gray-500">No photo uploaded.</span>
              )}
            </div> */}
            {/* Document Section */}
            {/* <div>
              <h4 className="font-semibold mb-2">Documents</h4>
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              ) : (
                <span className="text-gray-500">No document uploaded.</span>
              )}
            </div> */}
            {/* NOC Certificate Section */}
            {/* <div>
              <h4 className="font-semibold mb-2">NOC Certificate</h4>
              {nocUrl ? (
                <a
                  href={nocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View NOC Certificate
                </a>
              ) : (
                <span className="text-gray-500">No NOC certificate uploaded.</span>
              )}
            </div> */}
          </div>
          {/* Existing Client Information and Status-Specific Content */}
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