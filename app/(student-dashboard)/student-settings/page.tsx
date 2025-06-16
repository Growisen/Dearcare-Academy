"use client";

import { useState, useEffect } from "react";
import { getUserSession, AuthUser } from "../../../lib/auth";
import { Settings, Shield } from "lucide-react";
import PasswordUpdateForm from "../../../components/ui/PasswordUpdateForm";

export default function StudentSettings() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User session not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Security Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
          <Shield className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        </div>

        <PasswordUpdateForm userId={user.id} userType="student" />
      </div>

      {/* Additional Settings Sections can be added here */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-600">{user.name || 'Not provided'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-600">{user.email}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Role:</span>
            <span className="ml-2 text-gray-600 capitalize">{user.role}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Register No:</span>
            <span className="ml-2 text-gray-600">{user.register_no || 'Not provided'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">User ID:</span>
            <span className="ml-2 text-gray-600">{user.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
