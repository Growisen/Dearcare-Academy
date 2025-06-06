import React, { useState, useEffect, ChangeEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { StudentFormData, StepContentProps, AddStudentOverlayProps } from '../../types/student.types';
import { insertStudentData } from '../../lib/supabase';
// import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

type FormChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

interface SelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (e: FormChangeEvent) => void;
  [key: string]: unknown;
}

const calculateAge = (dob: string): number => {
  const [birthDate, today] = [new Date(dob), new Date()];
  const age = today.getFullYear() - birthDate.getFullYear();
  return today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) 
         ? age - 1 : age;
};

// Add validation utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone);
};

const validateAadhar = (aadhar: string): boolean => {
  return /^\d{12}$/.test(aadhar);
};

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
    services: [
      "Home Care Assistant",
      "Delivery Care Assistant",
      "Old Age Home/Rehabilitation Center",
      "Hospital Care",
      "Senior Citizens Assistant",
      "ICU Home Care Assistant",
      "Critical Illness Care Assistant",
      "Companion Ship Assistant",
      "Clinical Assistant"
    ],
    languages: [
      "English",
      "Hindi",
      "Malayalam",
      "Tamil",
      "Telugu",
      "Kannada",
      "Bengali",
      "Marathi",
      "Gujarati",
      "Urdu",
      "Punjabi",
      "Odia"
    ],
    motherTongue: [
      "English",
      "Hindi",
      "Malayalam",
      "Tamil",
      "Telugu",
      "Kannada",
      "Bengali",
      "Marathi",
      "Gujarati",
      "Urdu",
      "Punjabi",
      "Odia"
    ],
    courses: [
      "Advanced General Nursing Assistant (AGDA)",
      "Diploma in Healthcare Assistance",
      "Ayurveda Nursing & Baby Care"
    ],
  },
  steps: [
    "Personal Information", "Contact Information", "Academic Details",
    "Work Experience", "Guardian Information", "Health Information",
    "Documents & NOC", "Source & Status", "Service Preferences"
  ],
  styles: {
    input: "w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200",
    label: "block text-sm font-medium text-gray-700 mb-1",
    layout: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  },
  // Add validation messages and required fields
  validationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Phone number must be 10 digits',
    aadhar: 'Aadhar number must be 12 digits'
  },
  requiredFields: {
    personal: ['fullName', 'course'],
    contact: ['mobileNumber', 'email'],
    guardian: ['guardianAadhar']
  }
};

interface FieldError {
  error: boolean;
  message: string;
}

interface FieldErrors {
  [key: string]: FieldError;
}

const FormField = ({ label, children, required, error }: { 
  label: string, 
  children: React.ReactNode,
  required?: boolean,
  error?: FieldError
}) => (
  <div>
    <label className={FORM_CONFIG.styles.label}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error?.error && (
      <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>{error.message}</span>
      </p>
    )}
  </div>
);

interface FormFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: FieldError;
}

interface TextAreaProps {
  label: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (e: FormChangeEvent) => void;
  className?: string;
}

const Fields = {
  Input: ({ label, required, error, ...props }: FormFieldInputProps) => (
    <FormField label={label} required={required} error={error}>
      <Input 
        {...props} 
        className={`${FORM_CONFIG.styles.input} ${error?.error ? 'border-red-500 focus:ring-red-500' : ''}`} 
      />
    </FormField>
  ),

  Select: ({ label, options, required, error, ...props }: SelectProps & { required?: boolean, error?: FieldError }) => (
    <FormField label={label} required={required} error={error}>
      <select 
        className={`${FORM_CONFIG.styles.input} ${error?.error ? 'border-red-500 focus:ring-red-500' : ''}`} 
        {...props}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </FormField>
  ),

  TextArea: ({ label, ...props }: TextAreaProps) => (
    <FormField label={label}>
      <textarea {...props} className={FORM_CONFIG.styles.input} rows={3} />
    </FormField>
  ),

  File: ({ label, value, onChange, acceptTypes = ".pdf,.jpg,.jpeg,.png", fileType = "" }: { 
    label: string; 
    value?: File | null;
    onChange?: (file: File | null) => void;
    acceptTypes?: string;
    fileType?: string;
  }) => {
    const [fileName, setFileName] = useState<string>(value?.name || '');
    const [fileError, setFileError] = useState<string>("");
    
    useEffect(() => {
      setFileName(value?.name || '');
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFileError("");
      
      if (file) {
        // Validate file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (fileType === "photo") {
          if (!['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
            setFileError("Please select a JPG or PNG image file");
            return;
          }
          // Check photo size (500KB = 512000 bytes)
          if (file.size > 512000) {
            setFileError("Photo size should be less than 500KB");
            return;
          }
        } else if (fileType === "document") {
          if (fileExtension !== 'pdf') {
            setFileError("Please select a PDF document");
            return;
          }
          // Check document size (1MB = 1048576 bytes)
          if (file.size > 1048576) {
            setFileError("Document size should be less than 1MB");
            return;
          }
        }
        
        setFileName(file.name);
        onChange?.(file);
      } else {
        setFileName('');
        onChange?.(null);
      }
    };

    return (
      <div>
        <label className={FORM_CONFIG.styles.label}>{label}</label>
        <div className="mt-1 space-y-2">
          <input 
            type="file" 
            className="text-sm" 
            accept={acceptTypes}
            onChange={handleFileChange} 
          />
          {fileName && !fileError && (
            <p className="text-sm text-gray-500">Selected file: {fileName}</p>
          )}
          {fileError && (
            <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{fileError}</span>
            </p>
          )}
          <p className="text-xs text-gray-500">
            {fileType === "photo" ? "Accepted formats: JPG (Max size: 500KB)" : 
             fileType === "document" ? "Accepted format: PDF (Max size: 1MB)" : 
             ""}
          </p>
        </div>
      </div>
    );
  }
};

const validateField = (field: string, value: string): FieldError => {
  if (field === 'email' && value) {
    return {
      error: !validateEmail(value),
      message: FORM_CONFIG.validationMessages.email
    };
  }
  
  if (field === 'mobileNumber' && value) {
    return {
      error: !validatePhone(value),
      message: FORM_CONFIG.validationMessages.phone
    };
  }
  
  if (field === 'guardianAadhar' && value) {
    return {
      error: !validateAadhar(value),
      message: FORM_CONFIG.validationMessages.aadhar
    };
  }
  
  return { error: false, message: '' };
};

const handleFormChange = (
  field: keyof StudentFormData, 
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>,
  errors: FieldErrors, 
  setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>,
  requiredList?: string[]
) => (e: FormChangeEvent) => {
  const value = e.target.value;
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Update validation errors
  let error: FieldError = { error: false, message: '' };
  
  // Check if field is required
  if (requiredList?.includes(field as string) && !value) {
    error = { error: true, message: FORM_CONFIG.validationMessages.required };
  } else {
    // Check field format
    error = validateField(field as string, value);
  }
  
  setErrors(prev => ({ ...prev, [field]: error }));
};

const StepContent = {
  Personal: ({ formData, setFormData, errors, setErrors }: StepContentProps & { 
    errors: FieldErrors, 
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>> 
  }) => {
    const handleDateChange = (e: FormChangeEvent) => {
      const dob = e.target.value;
      if (dob) {
        const calculatedAge = calculateAge(dob);
        if (calculatedAge < 10) {
          setErrors(prev => ({
            ...prev,
            dateOfBirth: { error: true, message: "Invalid date of birth" }
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            dateOfBirth: { error: false, message: "" }
          }));
          setFormData({
            ...formData,
            dateOfBirth: dob,
            age: calculatedAge.toString()
          });
        }
      }
    };

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(formData.knownLanguages ? formData.knownLanguages.split(',').map(l => l.trim()) : []);

    const handleLanguageChange = (language: string) => {
      const updated = selectedLanguages.includes(language)
        ? selectedLanguages.filter(l => l !== language)
        : [...selectedLanguages, language];
      setSelectedLanguages(updated);
      setFormData({ ...formData, knownLanguages: updated.join(', ') });
    };

    return (
      <div className={FORM_CONFIG.styles.layout}>
        <Fields.Input 
          label="Full Name" 
          placeholder="Enter full name"
          value={formData.fullName}
          onChange={handleFormChange('fullName', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.personal)}
          required
          error={errors.fullName}
        />
        <Fields.Select 
          label="Course" 
          options={FORM_CONFIG.options.courses}
          value={formData.course}
          onChange={handleFormChange('course', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.personal)}
          required
          error={errors.course}
        />
        <Fields.Input 
          label="Date of Birth" 
          type="date"
          value={formData.dateOfBirth}
          onChange={handleDateChange}
          error={errors.dateOfBirth}
        />
        <Fields.Input 
          label="Age" 
          type="text"
          value={formData.age}
          readOnly
        />
        <Fields.Select 
          label="Gender" 
          options={FORM_CONFIG.options.gender}
          value={formData.gender}
          onChange={handleFormChange('gender', setFormData, errors, setErrors)}
        />
        <Fields.Select 
          label="Marital Status" 
          options={FORM_CONFIG.options.maritalStatus}
          value={formData.maritalStatus}
          onChange={handleFormChange('maritalStatus', setFormData, errors, setErrors)}
        />
        <Fields.Input 
          label="Nationality" 
          placeholder="Enter nationality"
          value={formData.nationality}
          onChange={handleFormChange('nationality', setFormData, errors, setErrors)}
        />
        <Fields.Input 
          label="State" 
          placeholder="Enter state"
          value={formData.state}
          onChange={handleFormChange('state', setFormData, errors, setErrors)}
        />
        <Fields.Input 
          label="City" 
          placeholder="Enter city"
          value={formData.city}
          onChange={handleFormChange('city', setFormData, errors, setErrors)}
        />
        <Fields.Input 
          label="Taluk" 
          placeholder="Enter taluk"
          value={formData.taluk}
          onChange={handleFormChange('taluk', setFormData, errors, setErrors)}
        />
        <Fields.Select
          label="Mother Tongue"
          options={FORM_CONFIG.options.motherTongue}
          value={formData.motherTongue}
          onChange={handleFormChange('motherTongue', setFormData, errors, setErrors)}
        />
        <div>
          <label className={FORM_CONFIG.styles.label}>Known Languages</label>
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {FORM_CONFIG.options.languages.map((language) => (
                <label key={language} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(language)}
                    onChange={() => handleLanguageChange(language)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{language}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Fields.Input 
          label="Religion" 
          placeholder="Enter religion"
          value={formData.religion}
          onChange={handleFormChange('religion', setFormData, errors, setErrors)}
        />
        <Fields.Select 
          label="Category" 
          options={FORM_CONFIG.options.category}
          value={formData.category}
          onChange={handleFormChange('category', setFormData, errors, setErrors)}
        />
      </div>
    );
  },

  Contact: ({ formData, setFormData, errors, setErrors }: StepContentProps & { 
    errors: FieldErrors, 
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>> 
  }) => {
    const handleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setFormData({
          ...formData,
          permanentAddress: formData.currentAddress,
          permanentPinCode: formData.currentPinCode,
        });
      } else {
        setFormData({
          ...formData,
          permanentAddress: '',
          permanentPinCode: '',
        });
      }
    };

    return (
      <div className="space-y-6">
        {/* Contact Details section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Contact Details</h4>
          <div className={FORM_CONFIG.styles.layout}>
            <Fields.Input 
              label="Email Address" 
              type="email" 
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleFormChange('email', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.contact)}
              required
              error={errors.email}
            />
            <Fields.Input 
              label="Mobile Number" 
              type="tel" 
              placeholder="Enter mobile number"
              value={formData.mobileNumber}
              onChange={handleFormChange('mobileNumber', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.contact)}
              required
              error={errors.mobileNumber}
            />
          </div>
        </div>

        {/* Current Address section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Current Address</h4>
          <Fields.TextArea 
            label="Address" 
            placeholder="Enter current address"
            value={formData.currentAddress}
            onChange={handleFormChange('currentAddress', setFormData, errors, setErrors)}
          />
          <div className={FORM_CONFIG.styles.layout}>
            <Fields.Input 
              label="PIN Code" 
              placeholder="Enter PIN code"
              value={formData.currentPinCode}
              onChange={handleFormChange('currentPinCode', setFormData, errors, setErrors)}
            />
          </div>
        </div>

        {/* Permanent Address section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Permanent Address</h4>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onChange={handleSameAddress}
              />
              <span className="text-gray-600">Same as Current Address</span>
            </label>
          </div>
          <Fields.TextArea 
            label="Address" 
            placeholder="Enter permanent address"
            value={formData.permanentAddress}
            onChange={handleFormChange('permanentAddress', setFormData, errors, setErrors)}
          />
          <div className={FORM_CONFIG.styles.layout}>
            <Fields.Input 
              label="PIN Code" 
              placeholder="Enter PIN code"
              value={formData.permanentPinCode}
              onChange={handleFormChange('permanentPinCode', setFormData, errors, setErrors)}
            />
          </div>
        </div>
      </div>
    );
  },

  Academic: ({ formData, setFormData }: StepContentProps) => {
    const getAcademicData = (level: string) => {
      const key = level === "10th (SSLC)" ? "sslc" : 
                  level === "12th (HSC)" ? "hsc" : 
                  level === "GDA" ? "gda" : "others";
      
      return formData.academics?.[key] || { institution: '', year: '', grade: '' };
    };

    const updateAcademicData = (level: string, field: string, value: string) => {
      const key = level === "10th (SSLC)" ? "sslc" : 
                  level === "12th (HSC)" ? "hsc" : 
                  level === "GDA" ? "gda" : "others";

      setFormData({
        ...formData,
        academics: {
          ...formData.academics,
          [key]: {
            ...formData.academics[key],
            [field]: value
          }
        }
      });
    };

    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Qualification</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Institution</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Year of Passing</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Percentage/Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {["10th (SSLC)", "12th (HSC)", "GDA", "Others"].map((level) => {
                const academicData = getAcademicData(level);
                return (
                  <tr key={level} className="hover:bg-gray-50 transition-colors">
                    {level === "Others" ? (
                      <td className="py-3 px-4">
                        <input
                          className="w-full text-sm border-gray-300 focus:outline-none cursor-text"
                          placeholder="Enter qualification"
                          value={formData.academics?.others?.qualification || ''}
                          onChange={(e) => updateAcademicData('Others', 'qualification', e.target.value)}
                        />
                      </td>
                    ) : (
                      <td className="py-3 px-4 text-sm text-gray-700">{level}</td>
                    )}
                    <td className="py-3 px-4">
                      <input
                        className="w-full text-sm border-gray-300 focus:outline-none cursor-text"
                        placeholder="Enter institution name"
                        value={academicData.institution}
                        onChange={(e) => updateAcademicData(level, 'institution', e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full text-sm border-gray-300 focus:outline-none cursor-text"
                        placeholder="YYYY"
                        value={academicData.year}
                        onChange={(e) => updateAcademicData(level, 'year', e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="w-full text-sm border-gray-300 focus:outline-none cursor-text"
                        placeholder="Enter grade/percentage"
                        value={academicData.grade}
                        onChange={(e) => updateAcademicData(level, 'grade', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 italic">
          Note: For percentage, enter values between 0-100. For grades, use the appropriate grade scale (e.g., A+, B, etc.)
        </p>
      </div>
    );
  },

  Work: ({ formData, setFormData }: StepContentProps) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.Input 
        label="Organization Name" 
        placeholder="Enter organization name"
        value={formData.organization}
        onChange={handleFormChange('organization', setFormData, {}, () => {})}
      />
      <Fields.Input 
        label="Role/Designation" 
        placeholder="Enter role/designation"
        value={formData.role}
        onChange={handleFormChange('role', setFormData, {}, () => {})}
      />
      <Fields.Input 
        label="Duration" 
        placeholder="Enter duration"
        value={formData.duration}
        onChange={handleFormChange('duration', setFormData, {}, () => {})}
      />
      <Fields.TextArea 
        label="Responsibilities" 
        placeholder="Enter responsibilities"
        value={formData.responsibilities}
        onChange={handleFormChange('responsibilities', setFormData, {}, () => {})}
      />
    </div>
  ),

  Guardian: ({ formData, setFormData, errors, setErrors }: StepContentProps & { 
    errors: FieldErrors, 
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>> 
  }) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.Input 
        label="Name" 
        placeholder="Enter guardian name"
        value={formData.guardianName}
        onChange={handleFormChange('guardianName', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.guardian)}
      />
      <Fields.Input 
        label="Relationship" 
        placeholder="Enter relationship"
        value={formData.guardianRelation}
        onChange={handleFormChange('guardianRelation', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.guardian)}
      />
      <Fields.Input 
        label="Contact Number" 
        type="tel" 
        placeholder="Enter contact number"
        value={formData.guardianContact}
        onChange={handleFormChange('guardianContact', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.guardian)}
      />
      <Fields.TextArea 
        label="Address" 
        placeholder="Enter guardian address"
        value={formData.guardianAddress}
        onChange={handleFormChange('guardianAddress', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.guardian)}
      />
      <Fields.Input 
        label="Aadhar Number" 
        placeholder="Enter aadhar number"
        value={formData.guardianAadhar}
        onChange={handleFormChange('guardianAadhar', setFormData, errors, setErrors, FORM_CONFIG.requiredFields.guardian)}
        required
        error={errors.guardianAadhar}
      />
    </div>
  ),

  Health: ({ formData, setFormData }: StepContentProps) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.TextArea 
        label="Current Health Status" 
        placeholder="Enter current health status"
        value={formData.healthStatus}
        onChange={handleFormChange('healthStatus', setFormData, {}, () => {})}
      />
      <Fields.TextArea 
        label="Disability Details" 
        placeholder="Enter disability details if any"
        value={formData.disability}
        onChange={handleFormChange('disability', setFormData, {}, () => {})}
      />
    </div>
  ),

  Source: ({ formData, setFormData }: StepContentProps) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.Select 
        label="Source of Information" 
        options={FORM_CONFIG.options.sourceOfInformation}
        value={formData.sourceOfInformation}
        onChange={handleFormChange('sourceOfInformation', setFormData, {}, () => {})}
      />
      <Fields.Input 
        label="Assigning Agent" 
        placeholder="Enter assigning agent"
        value={formData.assigningAgent}
        onChange={handleFormChange('assigningAgent', setFormData, {}, () => {})}
      />
      <Fields.Select 
        label="Priority" 
        options={FORM_CONFIG.options.priority}
        value={formData.priority}
        onChange={handleFormChange('priority', setFormData, {}, () => {})}
      />
      <Fields.Select 
        label="Status" 
        options={FORM_CONFIG.options.status}
        value={formData.status}
        onChange={handleFormChange('status', setFormData, {}, () => {})}
      />
      <Fields.Input 
        label="Category" 
        placeholder="Enter category"
        value={formData.sourceCategory}
        onChange={handleFormChange('sourceCategory', setFormData, {}, () => {})}
      />
      <Fields.Input 
        label="Sub Category" 
        placeholder="Enter sub category"
        value={formData.sourceSubCategory}
        onChange={handleFormChange('sourceSubCategory', setFormData, {}, () => {})}
      />
    </div>
  ),

  Services: ({ formData, setFormData }: StepContentProps) => (
    <div className="space-y-4">
      {FORM_CONFIG.options.services.map(service => (
        <div key={service}>
          <Fields.Select
            label={service}
            options={FORM_CONFIG.options.serviceInterest}
            value={formData.servicePreferences[service]}
            onChange={(e: FormChangeEvent) => setFormData({ 
              ...formData, 
              servicePreferences: { ...formData.servicePreferences, [service]: e.target.value } 
            })}
          />
        </div>
      ))}
    </div>
  )
};

export function AddStudentOverlay({ onClose, onAssign }: AddStudentOverlayProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<StudentFormData>({
    // Initialize with empty values
    fullName: '', dateOfBirth: '', age: '',course:'', gender: '', maritalStatus: '',
    nationality: '', state: '', city: '', taluk: '', motherTongue: '',
    knownLanguages: '', religion: '', category: '', email: '', mobileNumber: '',
    currentAddress: '', currentPinCode: '',
    permanentAddress: '', permanentPinCode: '',
    academics: {
      sslc: { institution: '', year: '', grade: '' },
      hsc: { institution: '', year: '', grade: '' },
      gda: { institution: '', year: '', grade: '' },
      others: { qualification: '', institution: '', year: '', grade: '' }
    },
    organization: '', role: '', duration: '', responsibilities: '',
    guardianName: '', guardianRelation: '', guardianContact: '', guardianAddress: '',
    guardianAadhar: '', healthStatus: '', disability: '', photo: null,
    documents: null, nocStatus: '', nocCertificate: null, sourceOfInformation: '',
    assigningAgent: '', priority: '', status: '', sourceCategory: '',
    sourceSubCategory: '', servicePreferences: {}
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  // const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      fullName: '', dateOfBirth: '', age: '',course:'', gender: '', maritalStatus: '',
      nationality: '', state: '', city: '', taluk: '', motherTongue: '',
      knownLanguages: '', religion: '', category: '', email: '', mobileNumber: '',
      currentAddress: '', currentPinCode: '',
      permanentAddress: '', permanentPinCode: '',
      academics: {
        sslc: { institution: '', year: '', grade: '' },
        hsc: { institution: '', year: '', grade: '' },
        gda: { institution: '', year: '', grade: '' },
        others: { qualification: '', institution: '', year: '', grade: '' }
      },
      organization: '', role: '', duration: '', responsibilities: '',
      guardianName: '', guardianRelation: '', guardianContact: '', guardianAddress: '',
      guardianAadhar: '', healthStatus: '', disability: '', photo: null,
      documents: null, nocStatus: '', nocCertificate: null, sourceOfInformation: '',
      assigningAgent: '', priority: '', status: '', sourceCategory: '',
      sourceSubCategory: '', servicePreferences: {}
    });
    setCurrentSection(0);
    setErrors({});
  };

  const validateCurrentSection = (): boolean => {
    let isValid = true;
    const newErrors: FieldErrors = {};
    
    let fieldsToValidate: string[] = [];
    
    // Determine which fields to validate based on current section
    if (currentSection === 0) {
      fieldsToValidate = FORM_CONFIG.requiredFields.personal;
    } else if (currentSection === 1) {
      fieldsToValidate = FORM_CONFIG.requiredFields.contact;
    } else if (currentSection === 4) {
      fieldsToValidate = FORM_CONFIG.requiredFields.guardian;
    }
    
    // Check required fields and their format
    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof StudentFormData] as string || '';
      
      if (!value) {
        newErrors[field] = { error: true, message: FORM_CONFIG.validationMessages.required };
        isValid = false;
      } else {
        const validationResult = validateField(field, value);
        if (validationResult.error) {
          newErrors[field] = validationResult;
          isValid = false;
        }
      }
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = async () => {
    if (currentSection === FORM_CONFIG.steps.length - 1) {
      try {
        // Validate all required fields before submitting
        let allValid = true;
        const newErrors: FieldErrors = {};
        
        [...FORM_CONFIG.requiredFields.personal, 
          ...FORM_CONFIG.requiredFields.contact, 
          ...FORM_CONFIG.requiredFields.guardian].forEach(field => {
          const value = formData[field as keyof StudentFormData] as string || '';
          
          if (!value) {
            newErrors[field] = { error: true, message: FORM_CONFIG.validationMessages.required };
            allValid = false;
          } else {
            const validationResult = validateField(field, value);
            if (validationResult.error) {
              newErrors[field] = validationResult;
              allValid = false;
            }
          }
        });
        
        setErrors(prev => ({ ...prev, ...newErrors }));
        
        if (!allValid) {
          toast.error('Please fix all errors before submitting');
          return;
        }
        
        const { error } = await insertStudentData(formData);
        
        if (error) {
          toast.error('Error submitting form: ' + error.message);
          return;
        }

        // Get the new student ID
        

        
        
        
        
        await toast.success('Student added successfully!', {
          duration: 3000
        });
        
        resetForm();
        onAssign(formData);
        onClose();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error('Error submitting form: ' + errorMessage);
      }
    } else {
      // Validate current section before moving to next
      const isSectionValid = validateCurrentSection();
      if (isSectionValid) {
        setCurrentSection(Math.min(FORM_CONFIG.steps.length - 1, currentSection + 1));
      }
    }
  };

  const renderStep = () => {
    const commonProps = { formData, setFormData, errors, setErrors };
    
    const stepComponents = {
      0: <StepContent.Personal {...commonProps} />,
      1: <StepContent.Contact {...commonProps} />,
      2: <StepContent.Academic formData={formData} setFormData={setFormData} />,
      3: <StepContent.Work formData={formData} setFormData={setFormData} />,
      4: <StepContent.Guardian {...commonProps} />,
      5: <StepContent.Health formData={formData} setFormData={setFormData} />,
      6: <div className="space-y-6">
           <Fields.File 
             label="Upload Photo" 
             value={formData.photo}
             onChange={(file) => setFormData({ ...formData, photo: file })}
             acceptTypes=".jpg,.jpeg,.png"
             fileType="photo"
           />
           <Fields.File 
             label="Upload Documents" 
             value={formData.documents}
             onChange={(file) => setFormData({ ...formData, documents: file })}
             acceptTypes=".pdf"
             fileType="document"
           />
           <Fields.Select 
             label="NOC Certificate Status" 
             options={FORM_CONFIG.options.nocStatus}
             value={formData.nocStatus}
             onChange={handleFormChange('nocStatus', setFormData, errors, setErrors)}
           />
           {formData.nocStatus === 'Yes' && (
             <Fields.File 
               label="Upload NOC Certificate" 
               value={formData.nocCertificate}
               onChange={(file) => setFormData({ ...formData, nocCertificate: file })}
               acceptTypes=".pdf"
               fileType="document"
             />
           )}
         </div>,
      7: <StepContent.Source formData={formData} setFormData={setFormData} />,
      8: <StepContent.Services formData={formData} setFormData={setFormData} />
    };
    return stepComponents[currentSection as keyof typeof stepComponents] || null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign New Student</h2>
            <p className="text-sm text-gray-500">Fill in the student details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="shrink-0 px-6 pt-4 overflow-x-auto scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <div className="flex justify-between mb-4 min-w-[900px] relative gap-2">
            {FORM_CONFIG.steps.map((section, index) => (
              <div 
                key={section} 
                className={`flex flex-col items-center transition-all duration-300 px-2 ${
                  index === currentSection ? 'scale-110' : 'scale-100'
                }`}
                ref={index === currentSection ? (el) => {
                  if (el) {
                    const container = el.parentElement?.parentElement;
                    if (container) {
                      const scrollLeft = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2);
                      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                  }
                } : undefined}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-sm ${
                  index <= currentSection ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="text-[11px] text-gray-600 text-center leading-tight max-w-[80px] whitespace-normal">
                  {section}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {FORM_CONFIG.steps[currentSection]}
            </h3>
            {renderStep()}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4 bg-white mt-auto flex justify-between">
          {['Previous', currentSection === FORM_CONFIG.steps.length - 1 ? 'Submit' : 'Next'].map((label, i) => (
            <button
              key={label}
              onClick={() => i === 0 ? setCurrentSection(Math.max(0, currentSection - 1)) : handleNext()}
              disabled={i === 0 && currentSection === 0}
              className={`px-4 py-2 text-sm rounded-lg ${
                i === 0 
                  ? 'bg-gray-100 text-gray-900 disabled:opacity-50 disabled:text-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}