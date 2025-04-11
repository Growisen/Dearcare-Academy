import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Maximize2, Loader2 } from 'lucide-react';

interface FollowUpContentProps {
  studentId?: string;
}

export function FollowUpContent({ studentId }: FollowUpContentProps) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [hasReceipt, setHasReceipt] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrideReceipt, setOverrideReceipt] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const fetchReceiptStatus = async () => {
      if (!studentId) return;

      try {
        // First check payment_receipt status from students table
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('payment_receipt')
          .eq('id', studentId)
          .single();

        if (studentError) throw studentError;
        setHasReceipt(student.payment_receipt);

        // Only fetch receipt URL if payment_receipt is true
        if (student.payment_receipt) {
          // Check if file exists
          const { data: files, error: listError } = await supabase.storage
            .from('DearCare')
            .list(`Students/${studentId}`);

          if (listError) throw listError;

          const receiptFile = files?.find(file => file.name === 'payment_receipt.pdf');
          if (!receiptFile) return;

          // Get public URL for the receipt
          const { data: { publicUrl } } = supabase.storage
            .from('DearCare')
            .getPublicUrl(`Students/${studentId}/payment_receipt.pdf`);

          setReceiptUrl(publicUrl);
        }
      } catch (error) {
        console.error('Error fetching receipt status:', error);
      }
    };

    fetchReceiptStatus();
  }, [studentId]);

  const handleApprove = async () => {
    if (!studentId) return;

    if (!hasReceipt && !overrideReceipt) {
      setShowWarning(true);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Fetch student details including course
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('name, email, course')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Update status to confirmed
      const { error: updateError } = await supabase
        .from('student_source')
        .update({ status: 'Confirmed' })
        .eq('student_id', studentId);

      if (updateError) throw updateError;

      // Send confirmation email via API
      const response = await fetch('/api/mail/confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: student.name,
          email: student.email,
          courseName: student.course,
          id: studentId,
        }),
      });

      const emailResult = await response.json();
      if (!emailResult.success) {
        throw new Error(emailResult.message);
      }

      // Reload the page or update UI state
      window.location.reload();

    } catch (err) {
      console.error('Error during approval:', err);
      setError(err instanceof Error ? err.message : 'Failed to process approval');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmApprove = () => {
    setOverrideReceipt(true);
    setShowWarning(false);
    handleApprove();
  };

  return (
    <div className="space-y-6">
      {hasReceipt === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Payment Receipt Missing</h3>
          </div>
          <p className="mt-1 text-sm text-red-600">
            Warning: The payment receipt has not been uploaded. You can still proceed with verification, 
            but it's recommended to have the receipt uploaded first.
          </p>
        </div>
      )}

      {showWarning && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Confirm Verification Without Receipt</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Are you sure you want to proceed with verification without a payment receipt?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmApprove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Yes, Proceed
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {receiptUrl ? (
        <div className="max-w-2xl mx-auto">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Payment Receipt</h3>
              <button 
                onClick={() => window.open(receiptUrl, '_blank')}
                className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 flex items-center gap-1 text-sm"
              >
                <Maximize2 className="h-4 w-4" />
                Full View
              </button>
            </div>
            <iframe
              src={`${receiptUrl}#view=FitH`}
              className="w-full h-[400px] border-0"
              title="Payment Receipt"
            />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50">
            <div className="px-4 py-6 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h3 className="font-medium text-red-700">No Payment Receipt Available</h3>
              <p className="text-sm text-red-600 text-center">
                No payment receipt has been uploaded for this student yet.
                <br />
                Please ensure the receipt is uploaded before proceeding with the verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button 
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isProcessing}
          onClick={handleApprove}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Approve'
          )}
        </button>
        <button 
          className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing}
        >
          Reject
        </button>
      </div>
    </div>
  );
}