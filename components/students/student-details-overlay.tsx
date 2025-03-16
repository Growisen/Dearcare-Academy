import React from 'react';
import { X } from 'lucide-react';
import { ClientInformation } from './studentInformation';
import { ApprovedContent } from './ConfirmedContent';
import { UnderReviewContent } from './UnderReview';
import { PendingContent } from './PendingContent';
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

export function StudentDetailsOverlay({ client, onClose }: ClientDetailsProps) {
  const renderStatusSpecificContent = () => {
    switch (client.status) {
      case "approved":
      case "confirmed":
        return <ApprovedContent client={client} />;
      case "follow-up":
        return <UnderReviewContent />;
      case "new":
        return <PendingContent />;
      case "rejected":
        return <RejectedContent />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
            <p className="text-sm text-gray-500">ID: {client.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          <ClientInformation client={client} />
          {renderStatusSpecificContent()}
        </div>
      </div>
    </div>
  );
}