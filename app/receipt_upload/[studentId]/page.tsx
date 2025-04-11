'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import UploadForm from '../UploadForm';
import { CircularProgress } from '@mui/material';

export default function Page() {
  const params = useParams();
  const studentId = params?.studentId as string;
  const [student, setStudent] = useState<{ name?: string; email?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/student/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch student details');
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <UploadForm
      studentId={studentId}
      studentName={student?.name}
      studentEmail={student?.email}
    />
  );
}
