"use client";

import { useState, useEffect } from "react";
import { getUserSession } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Edit3, Save, X } from "lucide-react";

interface SupervisorProfile {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  department: string;
  role: string;
  join_date: string;
  dob: string;
  gender: string;
  address: string;
  martialstatus: string;
}

export default function SupervisorProfile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<SupervisorProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<SupervisorProfile | null>(null);
  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      fetchProfile(currentUser.id);
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (supervisorId: number) => {
    try {
      const { data, error } = await supabase
        .from('academy_supervisors')
        .select('*')
        .eq('id', supervisorId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
        .from('academy_supervisors')
        .update({
          name: editedProfile.name,
          phone_no: editedProfile.phone_no,
          address: editedProfile.address,
        })
        .eq('id', editedProfile.id);

      if (error) throw error;

      setProfile(editedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: keyof SupervisorProfile, value: string) => {
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
    <div className="max-w-4xl mx-auto space-y-6">
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
            {editing ? (
              <input
                type="text"
                value={editedProfile?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            )}
            <p className="text-lg text-gray-600">{profile.role}</p>
            <p className="text-sm text-gray-500">{profile.department}</p>
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
                <p className="text-sm text-gray-500">Phone</p>
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile?.phone_no || ''}
                    onChange={(e) => handleInputChange('phone_no', e.target.value)}
                    className="text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone_no}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Address</p>
                {editing ? (
                  <textarea
                    value={editedProfile?.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full text-gray-900 border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{profile.address}</p>
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
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="text-gray-900">{new Date(profile.join_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Marital Status</p>
                <p className="text-gray-900">{profile.martialstatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}