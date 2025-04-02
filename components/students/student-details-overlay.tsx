import React, { useState } from 'react';
import { X, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ClientInformation } from './studentInformation';
import { ConfirmedContent } from './ConfirmedContent';
import { FollowUpContent } from './FollowUp';
import { NewContent } from './NewContent';
import { RejectedContent } from './RejectedContent';

interface ClientDetailsProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    requestDate: string;
    status: string;
    location: string;
    assignedNurse?: string;
    nurseContact?: string;
    shift?: string;
    condition?: string;
    description?: string;
    medications?: string[];
    specialInstructions?: string;
    nurseLocation?: { lat: number; lng: number };
    clientLocation?: { lat: number; lng: number };
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

export function StudentDetailsOverlay({ client, onClose }: ClientDetailsProps) {
  const [activeDialog, setActiveDialog] = useState<'delete' | 'proceed' | 'reject' | null>(null);

  const dialogConfigs: Record<NonNullable<typeof activeDialog>, DialogConfig> = {
    delete: {
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${client.name}'s record? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: () => {
        // TODO: Implement delete logic
        onClose();
      }
    },
    proceed: {
      title: 'Confirm Action',
      message: `Are you sure you want to proceed with ${client.name}'s application?`,
      confirmLabel: 'Proceed',
      confirmStyle: 'bg-green-600 hover:bg-green-700',
      onConfirm: () => setActiveDialog(null)
    },
    reject: {
      title: 'Confirm Rejection',
      message: `Are you sure you want to reject ${client.name}'s application?`,
      confirmLabel: 'Reject',
      onConfirm: () => setActiveDialog(null)
    }
  };

  const renderStatusSpecificContent = () => {
    switch (client.status) {
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
              <p className="text-sm text-gray-500">ID: {client.id}</p>
            </div>
            <div className="flex items-center gap-3">
              {!['confirmed', 'rejected'].includes(client.status) && (
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
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[client.status as keyof typeof STATUS_STYLES] || ''}`}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
        </div>

        <div className="px-6 py-4 space-y-6">
          <ClientInformation client={client} />
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