"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ error?: string; credentials?: { password: string; studentEmail?: string; supervisorEmail?: string } } | null>(null);

  const createTestUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_test_users' }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to create test users' });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = (role: 'admin' | 'student' | 'supervisor') => {
    const routes = {
      admin: '/dashboard',
      student: '/student-dashboard',
      supervisor: '/supervisor-dashboard'
    };
    router.push(routes[role]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Authentication Test
        </h1>

        <div className="space-y-4">
          <button
            onClick={createTestUsers}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test Users'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {result.error ? (
                <p>{result.error}</p>
              ) : (
                <div>
                  <p className="font-medium">Test users created!</p>
                  <div className="mt-2 text-sm">
                    <p><strong>Password:</strong> {result.credentials?.password}</p>
                    {result.credentials?.studentEmail && (
                      <p><strong>Student Email:</strong> {result.credentials.studentEmail}</p>
                    )}
                    {result.credentials?.supervisorEmail && (
                      <p><strong>Supervisor Email:</strong> {result.credentials.supervisorEmail}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <hr className="my-6" />

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Test Dashboard Access:</h3>
            
            <button
              onClick={() => testLogin('admin')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
            >
              Test Admin Dashboard
            </button>
            
            <button
              onClick={() => testLogin('student')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Test Student Dashboard
            </button>
            
            <button
              onClick={() => testLogin('supervisor')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Test Supervisor Dashboard
            </button>
          </div>

          <hr className="my-6" />

          <button
            onClick={() => router.push('/signin')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    </div>
  );
}
