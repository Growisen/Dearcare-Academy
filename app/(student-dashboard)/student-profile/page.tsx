"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { User, Mail, Phone, Calendar, Edit3, Save, X } from "lucide-react";

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  mobile: string;
  course: string;
  register_no: string;
  dob: string;
  gender: string;
  nationality: string;
  state: string;
  city: string;
  cur_address: string;
  perm_address: string;
}

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null);

  const fetchProfile = useCallback(async (studentId: number) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      fetchProfile(currentUser.id);
    }
    setLoading(false);
  }, [fetchProfile]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      const { error } = await supabase
        .from('students')
        .update({
          mobile: editedProfile.mobile,
          cur_address: editedProfile.cur_address,
          perm_address: editedProfile.perm_address,
        })
        .eq('id', editedProfile.id);

      if (error) throw error;

      setProfile(editedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <div className="flex space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-lg text-gray-600">{profile.course}</p>
              <p className="text-sm text-gray-500">{profile.register_no}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile?.mobile || ''}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.mobile}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Current Address</p>
                  {editing ? (
                    <textarea
                      value={editedProfile?.cur_address || ''}
                      onChange={(e) => handleInputChange('cur_address', e.target.value)}
                      className="w-full text-gray-900 border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.cur_address}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Permanent Address</p>
                  {editing ? (
                    <textarea
                      value={editedProfile?.perm_address || ''}
                      onChange={(e) => handleInputChange('perm_address', e.target.value)}
                      className="w-full text-gray-900 border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.perm_address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">{new Date(profile.dob).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900">{profile.gender}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="text-gray-900">{profile.nationality}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="text-gray-900">{profile.state}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-gray-900">{profile.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
