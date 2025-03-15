import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function RejectedContent() {
  const [reason, setReason] = useState('docs');
  const [notes, setNotes] = useState('Sample detailed notes from another form.');

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-2xl font-semibold text-gray-800">Rejection Record</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select reason...</option>
              <option value="docs">Insufficient documentation</option>
              <option value="area">Service unavailable in area</option>
              <option value="medical">Medical criteria not met</option>
              <option value="other">Other</option>
            </select>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add detailed notes..."
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] placeholder:text-gray-500"
          ></textarea>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200">
            Send Rejection Notice
          </button>
        </div>
      </div>
    </div>
  );
}