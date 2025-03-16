import React from 'react';
import { Mail, Phone, Briefcase, Calendar, MapPin, User } from 'lucide-react';

interface ClientInformationProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    requestDate: string;
    //condition?: string;
    location: string;
  };
}

export function ClientInformation({ client }: ClientInformationProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Contact Information</h3>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-sm text-gray-800">{client.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-800">{client.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm text-gray-800">{client.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Service Information</h3>
          
          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="text-sm text-gray-800">{client.service}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Request Date</p>
              <p className="text-sm text-gray-800">{client.requestDate}</p>
            </div>
          </div>

          {/* {client.condition && (
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="text-sm text-gray-800">{client.condition}</p>
              </div>
            </div>
          )} */}

          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-sm text-gray-800">{client.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}