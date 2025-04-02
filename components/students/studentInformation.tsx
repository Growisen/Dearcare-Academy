import React, { useState } from 'react';
import { Mail, Phone, User, Calendar, MapPin, Book, Briefcase, Users, Heart, FileText, File, Eye, Edit, Save, X } from 'lucide-react';

interface ClientInformationProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    requestDate: string;
    location: string;
    dateOfBirth?: string;
    age?: string;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    state?: string;
    city?: string;
    taluk?: string;
    motherTongue?: string;
    knownLanguages?: string;
    religion?: string;
    category?: string;
    academics?: {
      sslc: { institution: string; year: string; grade: string };
      hsc: { institution: string; year: string; grade: string };
      gda: { institution: string; year: string; grade: string };
      others: { qualification: string; institution: string; year: string; grade: string };
    };
    organization?: string;
    role?: string;
    duration?: string;
    responsibilities?: string;
    guardianName?: string;
    guardianRelation?: string;
    guardianContact?: string;
    guardianAddress?: string;
    guardianAadhar?: string;
    healthStatus?: string;
    disability?: string;
    nocStatus?: string;
    sourceOfInformation?: string;
    assigningAgent?: string;
    status?: string;
    priority?: string;
    sourceCategory?: string;
    sourceSubCategory?: string;
    servicePreferences?: Record<string, string>;
    currentAddress?: string;
    currentPinCode?: string;
    permanentAddress?: string;
    permanentPinCode?: string;
    photo?: string;
    documents?: string;
    nocCertificate?: string;
  };
}

interface FileUploadProps {
  label: string;
  file?: File | null;
  existingUrl?: string;
  onChange?: (file: File | null) => void;
}

const SERVICES = [
  "Home Care Assistant",
  "Delivery Care Assistant", 
  "Old Age Home/Rehabilitation Center",
  "Hospital Care",
  "Senior Citizens Assistant",
  "ICU Home Care Assistant",
  "Critical Illness Care Assistant",
  "Companion Ship Assistant",
  "Clinical Assistant"
];

const ACADEMIC_LEVELS = ['sslc', 'hsc', 'gda', 'others'] as const;

const FORM_CONFIG = {
  options: {
    gender: ["Male", "Female", "Other"],
    maritalStatus: ["Single", "Married", "Separated"],
    category: ["General", "OBC", "SC", "ST", "Other"],
    nocStatus: ["Yes", "No", "Applied", "Going To Apply"],
    priority: ["High", "Low", "Negative", "Normal"],
    status: ["Confirmed", "Follow-up", "New", "Rejected"],
    sourceOfInformation: [
      "Leads From Facebook",
      "Leads From IVR",
      "Leads From WhatsApp",
      "Phone Landline",
      "Justdial",
      "Newspaper",
      "Client Reference",
      "Sulekha",
      "Direct Entry",
      "Lead From CSV",
      "Referred By Person"
    ],
    serviceInterest: ["Interested", "Partially, If Trained", "Not Interested"],
    languages: [
      "English", "Hindi", "Malayalam", "Tamil", "Telugu", "Kannada",
      "Bengali", "Marathi", "Gujarati", "Urdu", "Punjabi", "Odia"
    ],
    motherTongue: [
      "English", "Hindi", "Malayalam", "Tamil", "Telugu", "Kannada",
      "Bengali", "Marathi", "Gujarati", "Urdu", "Punjabi", "Odia"
    ],
  }
};

const calculateAge = (dob: string): number => {
  const [birthDate, today] = [new Date(dob), new Date()];
  const age = today.getFullYear() - birthDate.getFullYear();
  return today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) 
         ? age - 1 : age;
};

const InfoSection = ({ title, icon: Icon, children, className = '' }: { 
  title: string; 
  icon: any; 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
      <Icon className="w-5 h-5 text-blue-500" />{title}
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">{children}</div>
  </div>
);

const InfoItem = ({ 
  label, 
  value, 
  isDocument, 
  documentUrl,
  isEditing,
  onChange,
  type = 'text',
  options,
  multiple = false,
  readOnly = false
}: { 
  label: string; 
  value?: string | null;
  isDocument?: boolean;
  documentUrl?: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'textarea' | 'date' | 'email' | 'tel' | 'number' | 'select' | 'checkbox-group';
  options?: string[];
  multiple?: boolean;
  readOnly?: boolean;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {isEditing ? (
      type === 'checkbox-group' && options ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-2 rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={value?.includes(opt)}
                  onChange={(e) => {
                    const currentValues = value ? value.split(', ') : [];
                    const newValues = e.target.checked
                      ? [...currentValues, opt]
                      : currentValues.filter(v => v !== opt);
                    onChange?.(newValues.join(', '));
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          className="w-full min-h-[100px] px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          rows={3}
        />
      ) : type === 'select' && options ? (
        <select 
          className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
        />
      )
    ) : (
      <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-lg">{value || 'N/A'}</p>
    )}
    {!isEditing && isDocument && documentUrl && (
      <button onClick={() => window.open(documentUrl, '_blank')} 
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
        <Eye className="w-4 h-4" />View
      </button>
    )}
  </div>
);

const DocumentSection = ({ doc, label, url }: { doc: string | undefined, label: string, url?: string }) => (
  <InfoItem 
    label={label}
    value={doc ? "Available" : "Not available"}
    isDocument={true}
    documentUrl={url}
  />
);

const FileUpload = ({ label, file, existingUrl, onChange }: FileUploadProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm text-gray-500">{label}</label>
      {existingUrl && (
        <a href={existingUrl} target="_blank" rel="noopener noreferrer" 
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <Eye className="w-4 h-4" />View current
        </a>
      )}
    </div>
    <input
      type="file"
      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
        file:rounded-full file:border-0 file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      onChange={(e) => {
        const selectedFile = e.target.files?.[0] || null;
        onChange?.(selectedFile);
      }}
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
    />
    {file && (
      <p className="text-sm text-gray-500">Selected: {file.name}</p>
    )}
  </div>
);

export function ClientInformation({ client: initialClient }: ClientInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [client, setClient] = useState(initialClient);
  const [files, setFiles] = useState({
    photo: null as File | null,
    documents: null as File | null,
    nocCertificate: null as File | null
  });

  const handleChange = <T extends string | Record<string, any>>(field: string, value: T) => {
    setClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setClient(initialClient);
    setIsEditing(false);
  };

  const renderDocuments = () => {
    if (!isEditing) {
      return (
        <div className="col-span-2 space-y-2 border rounded-lg p-3 bg-gray-50">
          <div className="border-b pb-2 mb-2">
            <InfoItem 
              label="NOC Status" 
              value={client.nocStatus} 
              isEditing={isEditing}
              onChange={(value) => handleChange('nocStatus', value)}
              type="select"
              options={FORM_CONFIG.options.nocStatus}
            />
            {client.nocStatus === 'Yes' && (
              <DocumentSection doc={client.nocCertificate} label="NOC Certificate" url={client.nocCertificate} />
            )}
          </div>
          <DocumentSection doc={client.photo} label="Photo" url={client.photo} />
          <DocumentSection doc={client.documents} label="Documents" url={client.documents} />
        </div>
      );
    }

    return (
      <div className="col-span-2 space-y-4 border rounded-lg p-3 bg-gray-50">
        <div className="border-b pb-4 mb-2">
          <InfoItem 
            label="NOC Status" 
            value={client.nocStatus} 
            isEditing={isEditing}
            onChange={(value) => handleChange('nocStatus', value)}
            type="select"
            options={FORM_CONFIG.options.nocStatus}
          />
          {client.nocStatus === 'Yes' && (
            <FileUpload
              label="NOC Certificate"
              file={files.nocCertificate}
              existingUrl={client.nocCertificate}
              onChange={(file) => {
                setFiles(prev => ({ ...prev, nocCertificate: file }));
                // Here you would typically handle the file upload
                // and update the client state with the new URL
              }}
            />
          )}
        </div>
        <FileUpload
          label="Photo"
          file={files.photo}
          existingUrl={client.photo}
          onChange={(file) => {
            setFiles(prev => ({ ...prev, photo: file }));
            // Handle file upload and update client state
          }}
        />
        <FileUpload
          label="Documents"
          file={files.documents}
          existingUrl={client.documents}
          onChange={(file) => {
            setFiles(prev => ({ ...prev, documents: file }));
            // Handle file upload and update client state
          }}
        />
      </div>
    );
  };

  const renderAcademics = () => {
    // Initialize empty academics data if it doesn't exist
    if (!client.academics) {
      const emptyAcademics = {
        sslc: { institution: '', year: '', grade: '' },
        hsc: { institution: '', year: '', grade: '' },
        gda: { institution: '', year: '', grade: '' },
        others: { qualification: '', institution: '', year: '', grade: '' }
      };
      setClient(prev => ({
        ...prev,
        academics: emptyAcademics
      }));
      return null;
    }
    
    return (
      <InfoSection title="Academic Details" icon={Book}>
        {ACADEMIC_LEVELS.map((level) => (
          <div key={level} className="col-span-2 border-b last:border-0 pb-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {level === 'others' ? 
                (client.academics?.others?.qualification || 'Other Qualification') : 
                level.toUpperCase()}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {['institution', 'year', 'grade'].map(field => {
                const academicLevel = client.academics?.[level];
                const value = academicLevel ? academicLevel[field as keyof typeof academicLevel] : '';
                return (
                  <InfoItem 
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)} 
                    value={value}
                    isEditing={isEditing}
                    onChange={(newValue) => {
                      const updatedAcademics = {
                        ...client.academics,
                        [level]: {
                          ...(client.academics?.[level] ?? {}),
                          [field]: newValue
                        }
                      };
                      handleChange('academics', updatedAcademics);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </InfoSection>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-6 py-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <div className="py-4 px-6 bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <InfoSection title="Personal Information" icon={User}>
              <InfoItem 
                label="Full Name" 
                value={client.name} 
                isEditing={isEditing}
                onChange={(value) => handleChange('name', value)}
                type="text"
              />
              <InfoItem 
                label="Date of Birth" 
                value={client.dateOfBirth} 
                isEditing={isEditing}
                onChange={(value) => {
                  handleChange('dateOfBirth', value);
                  if (value) {
                    handleChange('age', calculateAge(value).toString());
                  }
                }}
                type="date"
              />
              <InfoItem 
                label="Age" 
                value={client.age} 
                isEditing={isEditing}
                onChange={(value) => handleChange('age', value)}
                type="number"
                readOnly
              />
              <InfoItem 
                label="Gender" 
                value={client.gender} 
                isEditing={isEditing}
                onChange={(value) => handleChange('gender', value)}
                type="select"
                options={FORM_CONFIG.options.gender}
              />
              <InfoItem 
                label="Marital Status" 
                value={client.maritalStatus} 
                isEditing={isEditing}
                onChange={(value) => handleChange('maritalStatus', value)}
                type="select"
                options={FORM_CONFIG.options.maritalStatus}
              />
              <InfoItem 
                label="Nationality" 
                value={client.nationality} 
                isEditing={isEditing}
                onChange={(value) => handleChange('nationality', value)}
                type="text"
              />
              <InfoItem 
                label="State" 
                value={client.state} 
                isEditing={isEditing}
                onChange={(value) => handleChange('state', value)}
                type="text"
              />
              <InfoItem 
                label="City" 
                value={client.city} 
                isEditing={isEditing}
                onChange={(value) => handleChange('city', value)}
                type="text"
              />
              <InfoItem 
                label="Taluk" 
                value={client.taluk} 
                isEditing={isEditing}
                onChange={(value) => handleChange('taluk', value)}
                type="text"
              />
              <InfoItem 
                label="Mother Tongue" 
                value={client.motherTongue} 
                isEditing={isEditing}
                onChange={(value) => handleChange('motherTongue', value)}
                type="select"
                options={FORM_CONFIG.options.motherTongue}
              />
              <InfoItem 
                label="Known Languages" 
                value={client.knownLanguages} 
                isEditing={isEditing}
                onChange={(value) => handleChange('knownLanguages', value)}
                type="checkbox-group"
                options={FORM_CONFIG.options.languages}
                multiple
              />
              <InfoItem 
                label="Religion" 
                value={client.religion} 
                isEditing={isEditing}
                onChange={(value) => handleChange('religion', value)}
                type="text"
              />
              <InfoItem 
                label="Category" 
                value={client.category} 
                isEditing={isEditing}
                onChange={(value) => handleChange('category', value)}
                type="select"
                options={FORM_CONFIG.options.category}
              />
            </InfoSection>

            <InfoSection title="Contact Information" icon={Mail}>
              <InfoItem 
                label="Email" 
                value={client.email} 
                isEditing={isEditing}
                onChange={(value) => handleChange('email', value)}
                type="email"
              />
              <InfoItem 
                label="Phone" 
                value={client.phone} 
                isEditing={isEditing}
                onChange={(value) => handleChange('phone', value)}
                type="tel"
              />
              <InfoItem 
                label="Location" 
                value={client.location} 
                isEditing={isEditing}
                onChange={(value) => handleChange('location', value)}
              />
              <InfoItem 
                label="State" 
                value={client.state} 
                isEditing={isEditing}
                onChange={(value) => handleChange('state', value)}
              />
              <InfoItem 
                label="City" 
                value={client.city} 
                isEditing={isEditing}
                onChange={(value) => handleChange('city', value)}
              />
              <InfoItem 
                label="Taluk" 
                value={client.taluk} 
                isEditing={isEditing}
                onChange={(value) => handleChange('taluk', value)}
              />
              <div className="col-span-2 space-y-2 border-t pt-2">
                <h4 className="text-sm font-medium text-gray-700">Current Address</h4>
                <InfoItem 
                  label="Address" 
                  value={client.currentAddress} 
                  isEditing={isEditing}
                  onChange={(value) => handleChange('currentAddress', value)}
                  type="textarea"
                />
                <InfoItem 
                  label="PIN Code" 
                  value={client.currentPinCode} 
                  isEditing={isEditing}
                  onChange={(value) => handleChange('currentPinCode', value)}
                  type="number"
                />
              </div>
              <div className="col-span-2 space-y-2 border-t pt-2">
                <h4 className="text-sm font-medium text-gray-700">Permanent Address</h4>
                <InfoItem 
                  label="Address" 
                  value={client.permanentAddress} 
                  isEditing={isEditing}
                  onChange={(value) => handleChange('permanentAddress', value)}
                  type="textarea"
                />
                <InfoItem 
                  label="PIN Code" 
                  value={client.permanentPinCode} 
                  isEditing={isEditing}
                  onChange={(value) => handleChange('permanentPinCode', value)}
                  type="number"
                />
              </div>
            </InfoSection>

            {renderAcademics()}

            <InfoSection title="Work Experience" icon={Briefcase}>
              <InfoItem 
                label="Organization" 
                value={client.organization} 
                isEditing={isEditing}
                onChange={(value) => handleChange('organization', value)}
              />
              <InfoItem 
                label="Role" 
                value={client.role} 
                isEditing={isEditing}
                onChange={(value) => handleChange('role', value)}
              />
              <InfoItem 
                label="Duration" 
                value={client.duration} 
                isEditing={isEditing}
                onChange={(value) => handleChange('duration', value)}
              />
              <InfoItem 
                label="Responsibilities" 
                value={client.responsibilities} 
                isEditing={isEditing}
                onChange={(value) => handleChange('responsibilities', value)}
                type="textarea"
              />
            </InfoSection>

            <InfoSection title="Guardian Information" icon={Users}>
              <InfoItem 
                label="Guardian Name" 
                value={client.guardianName} 
                isEditing={isEditing}
                onChange={(value) => handleChange('guardianName', value)}
              />
              <InfoItem 
                label="Relationship" 
                value={client.guardianRelation} 
                isEditing={isEditing}
                onChange={(value) => handleChange('guardianRelation', value)}
              />
              <InfoItem 
                label="Contact" 
                value={client.guardianContact} 
                isEditing={isEditing}
                onChange={(value) => handleChange('guardianContact', value)}
                type="tel"
              />
              <InfoItem 
                label="Address" 
                value={client.guardianAddress} 
                isEditing={isEditing}
                onChange={(value) => handleChange('guardianAddress', value)}
                type="textarea"
              />
              <InfoItem 
                label="Aadhar Number" 
                value={client.guardianAadhar} 
                isEditing={isEditing}
                onChange={(value) => handleChange('guardianAadhar', value)}
                type="number"
              />
            </InfoSection>

            <InfoSection title="Health Information" icon={Heart}>
              <InfoItem 
                label="Health Status" 
                value={client.healthStatus} 
                isEditing={isEditing}
                onChange={(value) => handleChange('healthStatus', value)}
                type="textarea"
              />
              <InfoItem 
                label="Disability" 
                value={client.disability} 
                isEditing={isEditing}
                onChange={(value) => handleChange('disability', value)}
                type="textarea"
              />
            </InfoSection>

            <InfoSection title="Documents" icon={File}>
              {renderDocuments()}
            </InfoSection>

            <InfoSection title="Source Information" icon={FileText}>
              <InfoItem 
                label="Source" 
                value={client.sourceOfInformation} 
                isEditing={isEditing}
                onChange={(value) => handleChange('sourceOfInformation', value)}
                type="select"
                options={FORM_CONFIG.options.sourceOfInformation}
              />
              <InfoItem 
                label="Status" 
                value={client.status} 
                isEditing={isEditing}
                onChange={(value) => handleChange('status', value)}
                type="select"
                options={FORM_CONFIG.options.status}
              />
              <InfoItem 
                label="Assigning Agent" 
                value={client.assigningAgent} 
                isEditing={isEditing}
                onChange={(value) => handleChange('assigningAgent', value)}
              />
              <InfoItem 
                label="Priority" 
                value={client.priority} 
                isEditing={isEditing}
                onChange={(value) => handleChange('priority', value)}
                type="select"
                options={FORM_CONFIG.options.priority}
              />
              <InfoItem 
                label="Category" 
                value={client.sourceCategory} 
                isEditing={isEditing}
                onChange={(value) => handleChange('sourceCategory', value)}
              />
              <InfoItem 
                label="Sub Category" 
                value={client.sourceSubCategory} 
                isEditing={isEditing}
                onChange={(value) => handleChange('sourceSubCategory', value)}
              />
            </InfoSection>

            <InfoSection title="Service Preferences" icon={Briefcase}>
              {SERVICES.map(service => (
                <InfoItem 
                  key={service} 
                  label={service} 
                  value={client.servicePreferences?.[service] || 'Not specified'} 
                  isEditing={isEditing}
                  onChange={(value) => handleChange(`servicePreferences.${service}`, value)}
                  type="select"
                  options={FORM_CONFIG.options.serviceInterest}
                />
              ))}
            </InfoSection>
          </div>
        </div>
      </div>
    </div>
  );
}