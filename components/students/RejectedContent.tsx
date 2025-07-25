import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
//import { FileText } from 'lucide-react';

interface RejectedContentProps {
  studentId: string;
}

export function RejectedContent({ studentId }: RejectedContentProps) {
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchRejectionReason = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('academy_rejects')
          .select('reason')
          .eq('student_id', studentId)
          .single();

        if (error) {
          console.error('Error fetching rejection reason:', error.message || error);
          setError('Failed to load rejection reason.');
        } else {
          setRejectionReason(data?.reason || 'No reason provided');
        }
      } catch (err) {
        console.error('Unexpected error:', err instanceof Error ? err.message : String(err));
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchRejectionReason();
    } else {
      setError('No student ID provided.');
      setIsLoading(false);
    }
  }, [studentId]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[100px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading rejection details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="text-red-600 text-sm font-medium">Error</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Reject Reason</h3>
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Subject of Rejection</h4>
        <p className="px-4 py-2 text-sm text-gray-800 bg-gray-50 rounded-lg">
          {rejectionReason}
        </p>
      </div>
    </div>
  );
}