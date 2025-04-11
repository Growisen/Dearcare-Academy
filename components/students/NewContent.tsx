import React from 'react';

export function NewContent({ studentId }: { studentId: string }) {
  const handleVerification = async () => {
    try {
      const response = await fetch('/api/verify-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      // Optionally refresh the page or update UI
      window.location.reload();
    } catch (error) {
      console.error('Error during verification:', error);
      alert('Failed to verify details. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {/*
        <h3 className="text-lg font-medium text-gray-900 mb-4">Initial Assessment</h3>
        */}
        <div className="space-y-4">
          {/*}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                Request Medical Records
              </button>
              <button className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                Schedule Call
              </button>
            </div>
          </div>
            */}
          <button 
            onClick={handleVerification}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Verify Details
          </button>
        </div>
      </div>
    </div>
  );
}