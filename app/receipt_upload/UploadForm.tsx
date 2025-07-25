'use client';
import { useState } from 'react';
import { Button, Input, Alert } from '@mui/material';

interface UploadFormProps {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
}

export default function UploadForm({ studentId, studentName, studentEmail }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{message: string; error: boolean} | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setStatus({
          message: 'Only PDF files are allowed',
          error: true
        });
        setFile(null);
        return;
      }

      // Validate file size (1MB = 1024 * 1024 bytes)
      if (selectedFile.size > 1024 * 1024) {
        setStatus({
          message: 'File size must be less than 1MB',
          error: true
        });
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setStatus(null);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isUploading) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);

    try {
      const response = await fetch('/api/receipt_upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setStatus({
        message: 'Receipt uploaded successfully!',
        error: false
      });
      setFile(null);
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Failed to upload receipt',
        error: true
      });
    } finally {
      setTimeout(() => setIsUploading(false), 2000);
    }
  };

  return (
    <>
    <div className="p-6 max-w-md mx-auto bg-white min-h-screen">
    <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center bg-blue-300 py-4 px-8 rounded w-full">DearCare Academy</h2>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Payment Receipt</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Student ID: {studentId}</p>
        {studentName && <p className="text-gray-600 mt-2">Name: {studentName}</p>}
        {studentEmail && <p className="text-gray-600 mt-2">Email: {studentEmail}</p>}
      </div>

      {status && (
        <Alert 
          severity={status.error ? "error" : "success"}
          className="mb-4"
          sx={{ backgroundColor: status.error ? '#FEE2E2' : '#ECFDF5' }}
        >
          {status.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="file"
            onChange={handleFileChange}
            inputProps={{ 
              accept: 'application/pdf',
              title: 'Only PDF files up to 1MB are allowed'
            }}
            fullWidth
            required
            sx={{ 
              color: 'text.primary',
              backgroundColor: 'background.paper',
              '& .MuiInputBase-input': {
                color: 'text.primary'
              }
            }}
          />
        </div>

        <Button 
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!file || isUploading}
          sx={{
            mt: 2,
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Receipt'}
        </Button>
      </form>
    </div>
    </>
  );
}
