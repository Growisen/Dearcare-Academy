import React, { useEffect, useState } from 'react';
import { AlertTriangle, Maximize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ConfirmedContentProps {
  studentId: string;
}

export function ConfirmedContent({ studentId }: ConfirmedContentProps) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [hasReceipt, setHasReceipt] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchReceiptStatus = async () => {
      //console.log("fetchReceiptStatus called with studentId:", studentId); // Debug log
      if (!studentId) {
        console.warn("No studentId provided, skipping fetchReceiptStatus");
        return;
      }

      try {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('payment_receipt')
          .eq('id', studentId)
          .single();

        if (studentError) throw studentError;

        const receiptExists = !!student?.payment_receipt;
        //console.log("Receipt exists:", receiptExists, "Payment receipt value:", student.payment_receipt); // Debug log
        setHasReceipt(receiptExists);

        if (receiptExists) {
          const { data: { publicUrl } } = supabase.storage
            .from('DearCare')
            .getPublicUrl(`Students/${studentId}/payment_receipt.pdf`);

          if (!publicUrl) {
            throw new Error("Failed to generate public URL for receipt");
          }

          //console.log("Public URL for receipt:", publicUrl); // Debug log
          setReceiptUrl(publicUrl);
        } else {
          setReceiptUrl(null);
        }
      } catch (error) {
        console.error("Error fetching receipt status:", error);
        setHasReceipt(false);
        setReceiptUrl(null);
      }
    };

    fetchReceiptStatus();
  }, [studentId]);

  return (
    <div className="p-6 space-y-6">
      {hasReceipt === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Payment Receipt Missing</h3>
          </div>
          <p className="mt-1 text-sm text-red-600">
            Warning: The payment receipt has not been uploaded yet.
          </p>
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
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfirmedContent;