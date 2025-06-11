import React, { useState, useEffect } from 'react';
import { Mail, User, Book, Briefcase, Users, Heart, FileText, File, Eye, Edit, Save, X, LucideIcon } from 'lucide-react';
import { fetchStudentData } from '../../utils/studentData';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ClientInformationProps {
  studentId: string;  initialData?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    register_no?: string;
    //service: string;
   // requestDate: string;
    //location: string;
    dateOfBirth: string;
    age: string;
    gender: string;
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
    //priority?: string;
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
  } | null; // Add null as a possible type
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
  icon: LucideIcon;  // Changed from any to LucideIcon
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
//  multiple = false,
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

const ImagePreview = ({ url, className = '' }: { url: string; className?: string }) => (
  <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
    <Image 
      src={url} 
      alt="Preview" 
      width={100}
      height={100}
      className="w-full h-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
      }}
    />
  </div>
);

const DocumentPreview = ({ url }: { url: string }) => {
  const isPdf = url.toLowerCase().endsWith('.pdf');
  
  if (isPdf) {
    return (
      <div className="w-[500px] h-[550px] border rounded-lg overflow-hidden">
        <iframe src={`${url}#view=FitH`} className="w-full h-full"></iframe>
      </div>
    );
  }

  return (
    <div className="w-[300px] flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
      <FileText className="w-5 h-5 text-gray-500" />
      <span className="text-sm text-gray-600">Document Preview Not Available</span>
    </div>
  );
};

const DocumentSection = ({ doc, label, url }: { doc: string | undefined, label: string, url?: string }) => (
  <div className="space-y-2">
    <InfoItem 
      label={label}
      value={doc ? "Available" : "Not available"}
      isDocument={true}
      documentUrl={url}
    />
    {url && (
      <div className="mt-2">
        {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <ImagePreview url={url} className="h-[150px] w-[200px]" />
        ) : (
          <DocumentPreview url={url} />
        )}
      </div>
    )}
  </div>
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
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Selected: {file.name}</p>
        {file.type.startsWith('image/') && (
          <ImagePreview 
            url={URL.createObjectURL(file)} 
            className="h-[150px] w-[200px]" 
          />
        )}
      </div>
    )}
    {existingUrl && !file && (
      <div className="mt-2">
        {existingUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <ImagePreview url={existingUrl} className="h-[150px] w-[200px]" />
        ) : (
          <DocumentPreview url={existingUrl} />
        )}
      </div>
    )}
  </div>
);

export function ClientInformation({ studentId, initialData }: ClientInformationProps) {
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<NonNullable<ClientInformationProps['initialData']> | undefined>(initialData || undefined);
  const [originalData, setOriginalData] = useState<NonNullable<ClientInformationProps['initialData']> | undefined>(initialData || undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState({
    photo: null as File | null,
    documents: null as File | null,
    nocCertificate: null as File | null
  });

  useEffect(() => {
    const loadStudentData = async () => {
      if (!studentId) {
        setError('No student ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading student data for ID:', studentId);
        const { data, error } = await fetchStudentData(studentId);

        if (error as Error) {
          console.error('Error details:', error);
          setError((error as Error).message || 'Failed to load student information');
          return;
        }

        if (!data) {
          setError('No data found for this student');
          return;
        }

        // Transform the data to match the required type
        const transformedData: NonNullable<ClientInformationProps['initialData']> = {
          id: data.id || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          //service: data.service || 'Not specified',         // Add missing required field
          //requestDate: data.requestDate || new Date().toISOString().split('T')[0], // Add missing required field
          //location: data.location || 'Not specified',       // Add missing required field
          dateOfBirth: data.dateOfBirth || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          // Optional fields
          maritalStatus: data.maritalStatus || undefined,
          nationality: data.nationality || undefined,
          state: data.state || undefined,
          city: data.city || undefined,
          taluk: data.taluk || undefined,
          motherTongue: data.motherTongue || undefined,
          knownLanguages: data.knownLanguages || undefined,
          religion: data.religion || undefined,
          category: data.category || undefined,
          academics: data.academics,
          organization: data.organization || undefined,
          role: data.role || undefined,
          duration: data.duration || undefined,
          responsibilities: data.responsibilities || undefined,
          guardianName: data.guardianName || undefined,
          guardianRelation: data.guardianRelation || undefined,
          guardianContact: data.guardianContact || undefined,
          guardianAddress: data.guardianAddress || undefined,
          guardianAadhar: data.guardianAadhar || undefined,
          healthStatus: data.healthStatus || undefined,
          disability: data.disability || undefined,
          nocStatus: data.nocStatus || undefined,
          sourceOfInformation: data.sourceOfInformation || undefined,
          assigningAgent: data.assigningAgent || undefined,
          status: data.status || undefined,
          //priority: data.priority || undefined,
          sourceCategory: data.sourceCategory || undefined,
          sourceSubCategory: data.sourceSubCategory || undefined,
          servicePreferences: data.servicePreferences || {},
          currentAddress: data.currentAddress || undefined,
          currentPinCode: data.currentPinCode || undefined,
          permanentAddress: data.permanentAddress || undefined,
          permanentPinCode: data.permanentPinCode || undefined,
          photo: data.photo || undefined,
          documents: data.documents || undefined,
          nocCertificate: data.nocCertificate || undefined,
        };        setClient(transformedData);
        setOriginalData(transformedData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentData();
  }, [studentId]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (error || !client) {
    return <div className="text-center text-red-600 py-8">
      {error || 'No student information available'}
    </div>;
  }

  type ClientData = NonNullable<ClientInformationProps['initialData']>
  type ValueType = string | NonNullable<ClientData>['academics'] | Record<string, string>;
  const handleChange = <T extends ValueType>(field: string, value: T) => {
    setClient(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSave = async () => {
    if (!client) return;
    
    setIsSaving(true);
    try {
      // Update student data in the database
      const { error: studentError } = await supabase
        .from('students')
        .update({
          name: client.name,
          dob: client.dateOfBirth,
          age: parseInt(client.age),
          gender: client.gender,
          marital_status: client.maritalStatus,
          nationality: client.nationality,
          state: client.state,
          city: client.city,
          taluk: client.taluk,
          mother_tongue: client.motherTongue,
          languages: client.knownLanguages ? client.knownLanguages.split(',').map(lang => lang.trim()) : [],
          religion: client.religion,
          category: client.category,
          email: client.email,
          mobile: client.phone,
          cur_address: client.currentAddress,
          cur_pincode: client.currentPinCode,
          perm_address: client.permanentAddress,
          perm_pincode: client.permanentPinCode,
          cur_health_status: client.healthStatus,
          disability_details: client.disability,
          noc_status: client.nocStatus
        })
        .eq('id', studentId);

      if (studentError) throw studentError;

      // Update academics
      if (client.academics) {
        // Delete existing academic records
        await supabase
          .from('student_academics')
          .delete()
          .eq('student_id', studentId);

        // Insert new academic records
        const academicRecords = [];
        
        if (client.academics.sslc && (client.academics.sslc.institution || client.academics.sslc.year || client.academics.sslc.grade)) {
          academicRecords.push({
            student_id: parseInt(studentId),
            qualification: '10th (SSLC)',
            institution: client.academics.sslc.institution,
            year_of_passing: client.academics.sslc.year ? parseInt(client.academics.sslc.year) : null,
            marks: client.academics.sslc.grade
          });
        }
        
        if (client.academics.hsc && (client.academics.hsc.institution || client.academics.hsc.year || client.academics.hsc.grade)) {
          academicRecords.push({
            student_id: parseInt(studentId),
            qualification: '12th (HSC)',
            institution: client.academics.hsc.institution,
            year_of_passing: client.academics.hsc.year ? parseInt(client.academics.hsc.year) : null,
            marks: client.academics.hsc.grade
          });
        }
        
        if (client.academics.gda && (client.academics.gda.institution || client.academics.gda.year || client.academics.gda.grade)) {
          academicRecords.push({
            student_id: parseInt(studentId),
            qualification: 'GDA',
            institution: client.academics.gda.institution,
            year_of_passing: client.academics.gda.year ? parseInt(client.academics.gda.year) : null,
            marks: client.academics.gda.grade
          });
        }
        
        if (client.academics.others && (client.academics.others.qualification || client.academics.others.institution || client.academics.others.year || client.academics.others.grade)) {
          academicRecords.push({
            student_id: parseInt(studentId),
            qualification: client.academics.others.qualification || 'Other',
            institution: client.academics.others.institution,
            year_of_passing: client.academics.others.year ? parseInt(client.academics.others.year) : null,
            marks: client.academics.others.grade
          });
        }

        if (academicRecords.length > 0) {
          const { error: academicError } = await supabase
            .from('student_academics')
            .insert(academicRecords);

          if (academicError) throw academicError;
        }
      }

      // Update work experience
      if (client.organization || client.role || client.duration || client.responsibilities) {
        // Delete existing experience
        await supabase
          .from('student_experience')
          .delete()
          .eq('student_id', studentId);

        // Insert new experience
        const { error: experienceError } = await supabase
          .from('student_experience')
          .insert({
            student_id: parseInt(studentId),
            org_name: client.organization,
            role: client.role,
            duration: client.duration ? parseInt(client.duration) : null,
            responsibility: client.responsibilities
          });

        if (experienceError) throw experienceError;
      }

      // Update guardian information
      if (client.guardianName || client.guardianRelation || client.guardianContact || client.guardianAddress || client.guardianAadhar) {
        // Delete existing guardian info
        await supabase
          .from('student_guardian')
          .delete()
          .eq('student_id', studentId);

        // Insert new guardian info
        const { error: guardianError } = await supabase
          .from('student_guardian')
          .insert({
            student_id: parseInt(studentId),
            guardian_name: client.guardianName,
            relation: client.guardianRelation,
            mobile: client.guardianContact,
            address: client.guardianAddress,
            aadhaar: client.guardianAadhar
          });

        if (guardianError) throw guardianError;
      }

      // Update source information
      if (client.sourceOfInformation || client.assigningAgent || client.sourceCategory || client.sourceSubCategory) {
        // Check if record exists
        const { data: existingSource } = await supabase
          .from('student_source')
          .select('id')
          .eq('student_id', studentId)
          .single();

        if (existingSource) {
          const { error: sourceError } = await supabase
            .from('student_source')
            .update({
              source_of_info: client.sourceOfInformation,
              assigning_agent: client.assigningAgent,
              category: client.sourceCategory,
              sub_category: client.sourceSubCategory
            })
            .eq('student_id', studentId);

          if (sourceError) throw sourceError;
        } else {
          const { error: sourceError } = await supabase
            .from('student_source')
            .insert({
              student_id: parseInt(studentId),
              source_of_info: client.sourceOfInformation,
              assigning_agent: client.assigningAgent,
              category: client.sourceCategory,
              sub_category: client.sourceSubCategory
            });

          if (sourceError) throw sourceError;
        }
      }

      // Update service preferences
      if (client.servicePreferences && Object.keys(client.servicePreferences).length > 0) {
        // Delete existing preferences
        await supabase
          .from('student_preferences')
          .delete()
          .eq('student_id', studentId);

        // Insert new preferences
        const preferences = {
          student_id: parseInt(studentId),
          home_care: client.servicePreferences['Home Care Assistant'] || null,
          delivery_care: client.servicePreferences['Delivery Care Assistant'] || null,
          old_age_home: client.servicePreferences['Old Age Home/Rehabilitation Center'] || null,
          hospital_care: client.servicePreferences['Hospital Care'] || null,
          senior_citizen_assist: client.servicePreferences['Senior Citizens Assistant'] || null,
          icu_home_care: client.servicePreferences['ICU Home Care Assistant'] || null,
          critical_illness_care: client.servicePreferences['Critical Illness Care Assistant'] || null,
          companionship: client.servicePreferences['Companion Ship Assistant'] || null,
          clinical_assist: client.servicePreferences['Clinical Assistant'] || null
        };

        const { error: preferencesError } = await supabase
          .from('student_preferences')
          .insert(preferences);

        if (preferencesError) throw preferencesError;
      }

      setOriginalData(client);
      setIsEditing(false);
      toast.success('Student information updated successfully!');
    } catch (error) {
      console.error('Error saving student data:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setClient(originalData);
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
      setClient(prev => {
        if (!prev) return undefined;
        return {
          ...prev,
          academics: emptyAcademics
        };
      });
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
                      if (!client.academics) return;
                      
                      const updatedLevel = {
                        ...(client.academics[level] || {
                          institution: '',
                          year: '',
                          grade: '',
                          ...(level === 'others' ? { qualification: '' } : {})
                        }),
                        [field]: newValue
                      };
              
                      const updatedAcademics = {
                        ...client.academics,  // Spread existing academics first
                        [level]: updatedLevel // Then update the specific level
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">        <div className="py-4 px-6 bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />Save Changes
                      </>
                    )}
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
          <div className="grid grid-cols-1 gap-6">            <InfoSection title="Personal Information" icon={User}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={client.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                ) : (
                  <div className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-lg">
                    <div>{client.name || 'N/A'}</div>
                    {client.register_no && (
                      <div className="text-sm text-gray-500">({client.register_no})</div>
                    )}
                  </div>
                )}
              </div>
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
              {/*
              <InfoItem 
                label="Location" 
                value={client.location} 
                isEditing={isEditing}
                onChange={(value) => handleChange('location', value)}
              />
              */}
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
              {/*
              <InfoItem 
                label="Priority" 
                value={client.priority} 
                isEditing={isEditing}
                onChange={(value) => handleChange('priority', value)}
                type="select"
                options={FORM_CONFIG.options.priority}
              />
              */}
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