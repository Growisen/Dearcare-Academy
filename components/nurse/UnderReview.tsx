import React from 'react';

export function UnderReviewContent() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Checklist</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Verify nurse credentials</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Check availability</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Assess experience</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Verify references</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report</h3>
        <textarea
          placeholder="Add report notes..."
          className="w-full rounded-lg border-gray-300 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] placeholder:text-gray-500"
        ></textarea>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200">
          Approve & Assign
        </button>
        <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition duration-200">
          Reject
        </button>
      </div>
    </div>
  );
}