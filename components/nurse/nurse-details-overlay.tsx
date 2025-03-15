import React from 'react';
import { X } from 'lucide-react';
import { NurseInformation } from './nurseInformation';
import { ApprovedContent } from './ApprovedContent';
import { UnderReviewContent } from './UnderReview';
import { PendingContent } from './PendingContent';
import { RejectedContent } from './RejectedContent';

interface NurseDetailsProps {
  nurse: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    phoneNumber: string;
    gender: string;
    dob: string;
    salaryCap: number;
    hiringDate?: string;
    status: string;
    rating?: number;
    experience?: number;
    reviews?: { id: string; text: string; date: string; rating: number; reviewer: string; }[];
    image?: File;
    preferredLocations: string[];
  };
  onClose: () => void;
}

export function NurseDetailsOverlay({ nurse, onClose }: NurseDetailsProps) {
  const renderStatusSpecificContent = () => {
    switch (nurse.status) {
      case "assigned":
      case "leave":
      case "unassigned":
        return <ApprovedContent nurse={nurse} />;
      case "under_review":
        return <UnderReviewContent />;
      case "pending":
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
            <h2 className="text-xl font-semibold text-gray-900">Nurse Detials</h2>
            <p className="text-sm text-gray-500">ID: {nurse._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          <NurseInformation nurse={nurse} />
          {renderStatusSpecificContent()}
        </div>
      </div>
    </div>
  );
}