import React from 'react';

export function UnderReviewContent() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Checklist</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Verify medical documents</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Check care requirements</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Assess nurse availability</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Verify payment details</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Care Plan Draft</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recommended Nurse
              </label>
              <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select nurse...</option>
                <option value="mary">Mary Johnson</option>
                <option value="john">John Smith</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Shift
              </label>
              <select className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select shift...</option>
                <option value="morning">Morning (8 AM - 4 PM)</option>
                <option value="evening">Evening (4 PM - 12 AM)</option>
              </select>
            </div>
          </div>
          <textarea
            placeholder="Add care notes..."
            className="w-full rounded-lg border-gray-200 py-2 px-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] placeholder:text-gray-500"
          ></textarea>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Approve & Assign
        </button>
        <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
          Reject
        </button>
      </div>
    </div>
  );
}