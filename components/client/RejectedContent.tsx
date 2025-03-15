import React from 'react';

export function RejectedContent() {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Rejection Record</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason
            </label>
            <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select reason...</option>
              <option value="docs">Insufficient documentation</option>
              <option value="area">Service unavailable in area</option>
              <option value="medical">Medical criteria not met</option>
              <option value="other">Other</option>
            </select>
          </div>
          <textarea
            placeholder="Add detailed notes..."
            className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] placeholder:text-gray-500"
          ></textarea>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Send Rejection Notice
          </button>
        </div>
      </div>
    </div>
  );
}