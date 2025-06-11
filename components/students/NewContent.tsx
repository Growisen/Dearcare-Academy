import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function NewContent({ studentId }: { studentId: string }) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = async () => {
    setIsVerifying(true);
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

      toast.success('Student details verified successfully!');
      // Optionally refresh the page or update UI
      window.location.reload();    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('Failed to verify details. Please try again.');
    } finally {
      setIsVerifying(false);
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
            */}          <button 
            onClick={handleVerification}
            disabled={isVerifying}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Details'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}