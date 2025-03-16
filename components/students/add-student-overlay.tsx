import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/input';
import { StudentFormData, StepContentProps, AddStudentOverlayProps } from '../../types/supervisors.types';

const calculateAge = (dob: string): number => {
  const [birthDate, today] = [new Date(dob), new Date()];
  let age = today.getFullYear() - birthDate.getFullYear();
  return today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) 
         ? age - 1 : age;
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
  }
};

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className={FORM_CONFIG.styles.label}>{label}</label>
    {children}
  </div>
);

const Fields = {
  Input: ({ label, ...props }: { label: string; [key: string]: any }) => (
    <FormField label={label}>
      <Input {...props} className={FORM_CONFIG.styles.input} />
    </FormField>
  ),

  Select: ({ label, options, ...props }: { label: string; options: string[]; [key: string]: any }) => (
    <FormField label={label}>
      <select className={FORM_CONFIG.styles.input} {...props}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </FormField>
  ),

  TextArea: ({ label, ...props }: { label: string; [key: string]: any }) => (
    <FormField label={label}>
      <textarea {...props} className={FORM_CONFIG.styles.input} rows={3} />
    </FormField>
  ),

  File: ({ label, value, onChange }: { 
    label: string; 
    value?: File | null;
    onChange?: (file: File | null) => void 
  }) => {
    const [fileName, setFileName] = useState<string>(value?.name || '');
    
    useEffect(() => {
      setFileName(value?.name || '');
    }, [value]);

    return (
      <div>
        <label className={FORM_CONFIG.styles.label}>{label}</label>
        <div className="mt-1 space-y-2">
          <input 
            type="file" 
            className="text-sm" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFileName(file?.name || '');
              onChange?.(file);
            }} 
          />
          {fileName && (
            <p className="text-sm text-gray-500">Selected file: {fileName}</p>
          )}
        </div>
      </div>
    );
  }
};

const StepContent = {
  Personal: ({ formData, setFormData }: StepContentProps) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dob = e.target.value;
      if (dob) {
        const calculatedAge = calculateAge(dob);
        setFormData({
          ...formData,
          dateOfBirth: dob,
          age: calculatedAge.toString()
        });
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
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <Fields.Input 
          label="Date of Birth" 
          type="date"
          value={formData.dateOfBirth}
          onChange={handleDateChange}
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
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, gender: e.target.value })}
        />
        <Fields.Select 
          label="Marital Status" 
          options={FORM_CONFIG.options.maritalStatus}
          value={formData.maritalStatus}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, maritalStatus: e.target.value })}
        />
        <Fields.Input 
          label="Nationality" 
          placeholder="Enter nationality"
          value={formData.nationality}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, nationality: e.target.value })}
        />
        <Fields.Input 
          label="State" 
          placeholder="Enter state"
          value={formData.state}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, state: e.target.value })}
        />
        <Fields.Input 
          label="City" 
          placeholder="Enter city"
          value={formData.city}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, city: e.target.value })}
        />
        <Fields.Input 
          label="Taluk" 
          placeholder="Enter taluk"
          value={formData.taluk}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, taluk: e.target.value })}
        />
        <Fields.Select
          label="Mother Tongue"
          options={FORM_CONFIG.options.motherTongue}
          value={formData.motherTongue}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, motherTongue: e.target.value })}
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
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, religion: e.target.value })}
        />
        <Fields.Select 
          label="Category" 
          options={FORM_CONFIG.options.category}
          value={formData.category}
          onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>
    );
  },

  Contact: ({ formData, setFormData }: StepContentProps) => {
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
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, email: e.target.value })}
            />
            <Fields.Input 
              label="Mobile Number" 
              type="tel" 
              placeholder="Enter mobile number"
              value={formData.mobileNumber}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, mobileNumber: e.target.value })}
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
            onChange={(e: { target: { value: any; }; }) => {
              setFormData({ ...formData, currentAddress: e.target.value });
            }}
          />
          <div className={FORM_CONFIG.styles.layout}>
            <Fields.Input 
              label="PIN Code" 
              placeholder="Enter PIN code"
              value={formData.currentPinCode}
              onChange={(e: { target: { value: any; }; }) => {
                setFormData({ ...formData, currentPinCode: e.target.value });
              }}
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
            onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, permanentAddress: e.target.value })}
          />
          <div className={FORM_CONFIG.styles.layout}>
            <Fields.Input 
              label="PIN Code" 
              placeholder="Enter PIN code"
              value={formData.permanentPinCode}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, permanentPinCode: e.target.value })}
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
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, organization: e.target.value })}
      />
      <Fields.Input 
        label="Role/Designation" 
        placeholder="Enter role/designation"
        value={formData.role}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, role: e.target.value })}
      />
      <Fields.Input 
        label="Duration" 
        placeholder="Enter duration"
        value={formData.duration}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, duration: e.target.value })}
      />
      <Fields.TextArea 
        label="Responsibilities" 
        placeholder="Enter responsibilities"
        value={formData.responsibilities}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, responsibilities: e.target.value })}
      />
    </div>
  ),

  Guardian: ({ formData, setFormData }: StepContentProps) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.Input 
        label="Name" 
        placeholder="Enter guardian name"
        value={formData.guardianName}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, guardianName: e.target.value })}
      />
      <Fields.Input 
        label="Relationship" 
        placeholder="Enter relationship"
        value={formData.guardianRelation}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, guardianRelation: e.target.value })}
      />
      <Fields.Input 
        label="Contact Number" 
        type="tel" 
        placeholder="Enter contact number"
        value={formData.guardianContact}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, guardianContact: e.target.value })}
      />
      <Fields.TextArea 
        label="Address" 
        placeholder="Enter guardian address"
        value={formData.guardianAddress}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, guardianAddress: e.target.value })}
      />
      <Fields.Input 
        label="Aadhar Number" 
        placeholder="Enter aadhar number"
        value={formData.guardianAadhar}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, guardianAadhar: e.target.value })}
      />
    </div>
  ),

  Health: ({ formData, setFormData }: StepContentProps) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.TextArea 
        label="Current Health Status" 
        placeholder="Enter current health status"
        value={formData.healthStatus}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, healthStatus: e.target.value })}
      />
      <Fields.TextArea 
        label="Disability Details" 
        placeholder="Enter disability details if any"
        value={formData.disability}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, disability: e.target.value })}
      />
    </div>
  ),

  Source: ({ formData, setFormData }: StepContentProps) => (
    <div className={FORM_CONFIG.styles.layout}>
      <Fields.Select 
        label="Source of Information" 
        options={FORM_CONFIG.options.sourceOfInformation}
        value={formData.sourceOfInformation}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, sourceOfInformation: e.target.value })}
      />
      <Fields.Input 
        label="Assigning Agent" 
        placeholder="Enter assigning agent"
        value={formData.assigningAgent}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, assigningAgent: e.target.value })}
      />
      <Fields.Select 
        label="Priority" 
        options={FORM_CONFIG.options.priority}
        value={formData.priority}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, priority: e.target.value })}
      />
      <Fields.Select 
        label="Status" 
        options={FORM_CONFIG.options.status}
        value={formData.status}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, status: e.target.value })}
      />
      <Fields.Input 
        label="Category" 
        placeholder="Enter category"
        value={formData.sourceCategory}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, sourceCategory: e.target.value })}
      />
      <Fields.Input 
        label="Sub Category" 
        placeholder="Enter sub category"
        value={formData.sourceSubCategory}
        onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, sourceSubCategory: e.target.value })}
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
            onChange={(e: { target: { value: any; }; }) => setFormData({ 
              ...formData, 
              servicePreferences: { ...formData.servicePreferences, [service]: e.target.value } 
            })}
          />
        </div>
      ))}
    </div>
  )
};

export function AddStudentOverlay({ supervisorId, onClose, onAssign }: AddStudentOverlayProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<StudentFormData>({
    // Initialize with empty values
    fullName: '', dateOfBirth: '', age: '', gender: '', maritalStatus: '',
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

  const handleNext = async () => {
    if (currentSection === FORM_CONFIG.steps.length - 1) {
      try {
        const isValid = validateFormData(formData);
        if (!isValid) {
          return;
        }
        onAssign(formData);
                onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        // Reset loading state if needed
        // setIsSubmitting(false);
      }
    } else {
      setCurrentSection(Math.min(FORM_CONFIG.steps.length - 1, currentSection + 1));
    }
  };

  const validateFormData = (data: StudentFormData): boolean => {
    // Add your validation logic here
    return true;
  };

  const renderStep = () => {
    const stepComponents = {
      0: <StepContent.Personal formData={formData} setFormData={setFormData} />,
      1: <StepContent.Contact formData={formData} setFormData={setFormData} />,
      2: <StepContent.Academic formData={formData} setFormData={setFormData} />,
      3: <StepContent.Work formData={formData} setFormData={setFormData} />,
      4: <StepContent.Guardian formData={formData} setFormData={setFormData} />,
      5: <StepContent.Health formData={formData} setFormData={setFormData} />,
      6: <div className="space-y-6">
           <Fields.File 
             label="Upload Photo" 
             value={formData.photo}
             onChange={(file) => setFormData({ ...formData, photo: file })}
           />
           <Fields.File 
             label="Upload Documents" 
             value={formData.documents}
             onChange={(file) => setFormData({ ...formData, documents: file })}
           />
           <Fields.Select 
             label="NOC Certificate Status" 
             options={FORM_CONFIG.options.nocStatus}
             value={formData.nocStatus}
             onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, nocStatus: e.target.value })}
           />
           {formData.nocStatus === 'Yes' && (
             <Fields.File 
               label="Upload NOC Certificate" 
               value={formData.nocCertificate}
               onChange={(file) => setFormData({ ...formData, nocCertificate: file })}
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