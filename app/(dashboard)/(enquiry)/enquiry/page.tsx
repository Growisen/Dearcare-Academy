'use client';

import { useEffect, useState } from 'react';
import { getVisibleEnquiries, hideEnquiry } from '@/lib/supabase';

interface Enquiry {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone_no: string;
  course: string;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    const { data, error } = await getVisibleEnquiries();
    if (error) {
      setError(error.message);
      return;
    }
    if (data) setEnquiries(data);
  };

  const handleHide = async (id: number) => {
    const { error } = await hideEnquiry(id);
    if (!error) {
      setEnquiries(enquiries.filter(e => e.id !== id));
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading enquiries: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Enquiries</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b">Date</th>
              <th className="px-6 py-3 border-b">Name</th>
              <th className="px-6 py-3 border-b">Email</th>
              <th className="px-6 py-3 border-b">Phone</th>
              <th className="px-6 py-3 border-b">Course</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  {new Date(enquiry.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 border-b">{enquiry.name}</td>
                <td className="px-6 py-4 border-b">{enquiry.email}</td>
                <td className="px-6 py-4 border-b">{enquiry.phone_no}</td>
                <td className="px-6 py-4 border-b">{enquiry.course}</td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleHide(enquiry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Hide
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
