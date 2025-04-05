import React, { useEffect, useState } from 'react';
import { supabase } from '../../app/lib/supabase';
import { AlertTriangle, Maximize2 } from 'lucide-react';

interface FollowUpContentProps {
  studentId?: string;
}

export function FollowUpContent({ studentId }: FollowUpContentProps) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [hasReceipt, setHasReceipt] = useState<boolean | null>(null);

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

  return (
    <div className="space-y-6">
      {hasReceipt === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Payment Receipt Missing</h3>
          </div>
          <p className="mt-1 text-sm text-red-600">
            The payment receipt has not been uploaded yet. Please ensure the receipt is uploaded before proceeding.
          </p>
        </div>
      )}

      {receiptUrl && (
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
      )}

      <div className="flex gap-3">
        <button 
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          disabled={!hasReceipt}
        >
          Approve & Assign
        </button>
        <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
          Reject
        </button>
      </div>
    </div>
  );
}