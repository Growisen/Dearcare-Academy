import React from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, User, CheckCircle } from 'lucide-react';

interface NurseInformationProps {
  nurse: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    phoneNumber: string;
    gender: string;
    dob: string;
    experience?: number;
    image?: File;
    preferredLocations: string[];
  };
}

export function NurseInformation({ nurse }: NurseInformationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Profile Image Section */}
        {nurse.image ? (
          <div className="relative">
            <img 
              src={URL.createObjectURL(nurse.image)} 
              alt={`${nurse.firstName} ${nurse.lastName}`} 
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-gray-800">{`${nurse.firstName} ${nurse.lastName}`}</h2>
          <p className="text-sm text-gray-500">Registered Nurse</p>
          {/* Availability Status */}
          <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-700">Available for new assignments</p>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Contact Information</h3>
          
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-800">{nurse.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm text-gray-800">{nurse.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-sm text-gray-800">{nurse.location}</p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-sm text-gray-800">{nurse.gender}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="text-sm text-gray-800">
                {formatDate(nurse.dob)}
                <span className="text-gray-500 ml-1">({calculateAge(nurse.dob)} years old)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="text-sm text-gray-800">
                {nurse.experience} years
                <span className="text-gray-500 ml-1">of professional experience</span>
              </p>
            </div>
          </div>

          {nurse.preferredLocations && nurse.preferredLocations.length > 0 && (
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Preferred Locations</p>
                <p className="text-sm text-gray-800">{nurse.preferredLocations.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}