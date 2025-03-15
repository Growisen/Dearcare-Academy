import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { AddNurseProps, DropdownProps, BaseNurseFields, NurseFormData, NurseReferenceData, NurseHealthData } from '@/types/client.types';

const FORM_CONFIG = {
  options: {
    locationsInKerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram"] as string[],
    languagesAvailable: ["English", "Malayalam", "Hindi", "Tamil", "Kannada", "Telugu"] as string[],
    maritalStatus: ["Single", "Married", "Widow", "Separated"] as string[],
    religions: ["Hindu", "Christian", "Muslim", "Other"] as string[],
    serviceTypes: ["Home Nurse", "Delivery Care", "Baby Care", "HM"] as string[],
    shiftingPatterns: ["24 Hour", "12 Hour", "8 Hour", "Hourly"] as string[],
    staffCategories: ["Permanent", "Trainee", "Temporary"] as string[],
    nocOptions: ["Yes", "No", "Applied", "Going To Apply"] as string[],
    sourceOfInformation: [
      "Leads From Facebook",
      "Leads From Ivr",
      "Leads From WhatsApp",
      "Phone Landline",
      "Justdial",
      "Newspaper",
      "Client Reference",
      "Sulekha",
      "Direct Entry",
      "Lead From Csv"
    ] as string[]
  },
  steps: ["Personal Details", "Contact Information", "References", "Work Details", "Health & Additional Info", "Document Upload"],
  styles: {
    input: "w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200",
    label: "block text-sm font-medium text-gray-700 mb-1",
    button: "px-4 py-2 text-sm rounded-lg transition-colors duration-200",
    layout: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }
} as const;

// Utility components
const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className={FORM_CONFIG.styles.label}>{label}</label>
    {children}
  </div>
);

const FormLayout = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`${FORM_CONFIG.styles.layout} ${className}`}>{children}</div>
);

// Form field components consolidated into a single object
const Fields = {
  Input: ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <FormField label={label}>
      <input {...props} className={FORM_CONFIG.styles.input} />
    </FormField>
  ),

  Select: ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
    <FormField label={label}>
      <select className={FORM_CONFIG.styles.input} value={value} onChange={onChange}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </FormField>
  ),

  TextArea: ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <FormField label={label}>
      <textarea {...props} className={FORM_CONFIG.styles.input} rows={3} />
    </FormField>
  ),

  Dropdown: ({ label, options, selectedOptions, toggleOption, isOpen, setIsOpen, dropdownRef }: DropdownProps) => (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-gray-400 text-xs ml-1">({selectedOptions.length} selected)</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 flex items-center justify-between"
      >
        <span className="truncate">{selectedOptions.length ? `${selectedOptions.length} selected` : 'Select options...'}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-1">
            {options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => toggleOption(option)}
                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center justify-between group transition-colors duration-200"
              >
                <span>{option}</span>
                {selectedOptions.includes(option) && <Check className="h-4 w-4 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedOptions.map((option: string, idx: number) => (
          <div key={idx} className="flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm group hover:bg-blue-100 transition-colors duration-200">
            {option}
            <button type="button" onClick={() => toggleOption(option)} className="ml-2 text-blue-400 hover:text-blue-600 group-hover:text-blue-700" aria-label={`Remove ${option}`}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  ),

  File: ({ label, docType, onFileSelect }: { label: string, docType: string, onFileSelect: (file: File) => void }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        onFileSelect(file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setPreview(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose File
            </button>
            <span className="ml-3 text-sm text-gray-500">
              {fileInputRef.current?.files?.[0]?.name || "No file chosen"}
            </span>
          </div>
          {preview && (
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    );
  }
};

// Step content components
const StepContent = {
  Personal: ({ formData, setFormData }: { formData: NurseFormData, setFormData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => {
    const calculateAge = (dob: string) => {
      if (!dob) return;
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    };

    return (
      <FormLayout>
        <Fields.Input label="First Name" placeholder="Enter first name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
        <Fields.Input label="Last Name" placeholder="Enter last name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
        <Fields.Select label="Gender" options={["Male", "Female"]} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
        <Fields.Select label="Marital Status" options={FORM_CONFIG.options.maritalStatus} value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })} />
        <Fields.Input 
          label="Date of Birth" 
          type="date" 
          placeholder="" 
          value={formData.date_of_birth}
          onChange={(e) => {
            setFormData({ ...formData, date_of_birth: e.target.value });
            calculateAge(e.target.value);
          }}
        />
        <Fields.Input 
          label="Age" 
          type="number" 
          value={formData.age} 
          disabled 
          placeholder="Auto-calculated"
        />
        <Fields.Select label="Religion" options={FORM_CONFIG.options.religions} value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} />
        <Fields.Input label="Mother Tongue" placeholder="Enter mother tongue" value={formData.mother_tongue} onChange={(e) => setFormData({ ...formData, mother_tongue: e.target.value })} />
      </FormLayout>
    );
  },

  Contact: ({ formData, setFormData }: { formData: NurseFormData, setFormData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(formData.languages);
    const [isLanguagesDropdownOpen, setIsLanguagesDropdownOpen] = useState(false);
    const languagesDropdownRef = useRef<HTMLDivElement>(null);

    const toggleLanguage = (language: string) => {
      const newLanguages = selectedLanguages.includes(language) 
        ? selectedLanguages.filter((lang) => lang !== language)
        : [...selectedLanguages, language];
      setSelectedLanguages(newLanguages);
      setFormData({ ...formData, languages: newLanguages });
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (languagesDropdownRef.current && !languagesDropdownRef.current.contains(event.target as Node)) {
          setIsLanguagesDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <FormLayout>
        <div className="sm:col-span-2">
          <Fields.Input label="Address" placeholder="Enter full address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <Fields.Input label="City" placeholder="Enter city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
        <Fields.Input label="Taluk" placeholder="Enter taluk" value={formData.taluk} onChange={(e) => setFormData({ ...formData, taluk: e.target.value })} />
        <Fields.Input label="State" placeholder="Enter state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
        <Fields.Input label="PIN Code" placeholder="Enter PIN code" value={formData.pin_code} onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })} />
        <Fields.Input label="Phone Number" placeholder="Enter phone number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
        <Fields.Dropdown 
          label="Known Languages"
          options={FORM_CONFIG.options.languagesAvailable}
          selectedOptions={selectedLanguages}
          toggleOption={toggleLanguage}
          isOpen={isLanguagesDropdownOpen}
          setIsOpen={setIsLanguagesDropdownOpen}
          dropdownRef={languagesDropdownRef as React.RefObject<HTMLDivElement>}
        />
      </FormLayout>
    );
  },

  Document: ({ setDocuments, nurseData, setNurseData }: { setDocuments: React.Dispatch<React.SetStateAction<{[key: string]: File | null}>>, nurseData: NurseFormData, setNurseData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => {
    const [nocStatus, setNocStatus] = useState<string>(nurseData.noc_status);

    return (
      <div className="space-y-6">
        <Fields.File 
          label="Aadhar Card" 
          docType="aadhar" 
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, aadhar: file }))}
        />
        <Fields.File 
          label="Ration Card" 
          docType="rationCard"
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, rationCard: file }))}
        />
        <Fields.File 
          label="Educational Certificates" 
          docType="education"
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, education: file }))}
        />
        <Fields.File 
          label="Experience Certificates" 
          docType="experience"
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, experience: file }))}
        />
        <div className="space-y-4">
          <FormField label="NOC Certificate Status">
            <select 
              className={FORM_CONFIG.styles.input}
              value={nocStatus}
              onChange={(e) => {
                setNocStatus(e.target.value);
                setNurseData({ ...nurseData, noc_status: e.target.value });
              }}
            >
              <option value="">Select NOC status</option>
              {FORM_CONFIG.options.nocOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FormField>
          
          {nocStatus === 'Yes' && (
            <Fields.File 
              label="NOC Certificate" 
              docType="noc"
              onFileSelect={(file) => setDocuments(prev => ({ ...prev, noc: file }))}
            />
          )}
        </div>
      </div>
    )
  },

  Reference: ({ data, setData }: { data: NurseReferenceData, setData: React.Dispatch<React.SetStateAction<NurseReferenceData>> }) => (
    <div className="space-y-8">
      {/* Primary Reference */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h4 className="text-base font-medium">Primary Reference</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Fields.Input label="Full Name" placeholder="Enter name" value={data.reference_name} onChange={(e) => setData({ ...data, reference_name: e.target.value })} />
          <Fields.Input label="Relation" placeholder="Enter relation" value={data.reference_relation} onChange={(e) => setData({ ...data, reference_relation: e.target.value })} />
          <Fields.Input label="Phone Number" type="tel" placeholder="Enter phone number" value={data.reference_phone} onChange={(e) => setData({ ...data, reference_phone: e.target.value })} />
        </div>
        
        <Fields.TextArea 
          label="Recommendation Details"
          placeholder="Please provide details about why they recommend this nurse..."
          rows={3}
          value={data.recommendation_details}
          onChange={(e) => setData({ ...data, recommendation_details: e.target.value })}
        />
      </div>

      {/* Family References */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h4 className="text-base font-medium">Family References</h4>
        </div>

        {[0, 1].map(index => (
          <div key={index} className="space-y-2">
            <p className="text-sm text-gray-500">Reference {index + 1}</p>
            <div className="grid grid-cols-3 gap-4">
              <Fields.Input 
                label="Full Name" 
                placeholder="Enter name" 
                value={data.family_references[index]?.name || ''}
                onChange={(e) => {
                  const newRefs = [...data.family_references];
                  newRefs[index] = { ...newRefs[index] || {}, name: e.target.value };
                  setData({ ...data, family_references: newRefs });
                }}
              />
              <Fields.Input 
                label="Relation" 
                placeholder="Enter relation"
                value={data.family_references[index]?.relation || ''}
                onChange={(e) => {
                  const newRefs = [...data.family_references];
                  newRefs[index] = { ...newRefs[index] || {}, relation: e.target.value };
                  setData({ ...data, family_references: newRefs });
                }}
              />
              <Fields.Input 
                label="Phone Number" 
                type="tel" 
                placeholder="Enter phone number"
                value={data.family_references[index]?.phone || ''}
                onChange={(e) => {
                  const newRefs = [...data.family_references];
                  newRefs[index] = { ...newRefs[index] || {}, phone: e.target.value };
                  setData({ ...data, family_references: newRefs });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  Work: ({ formData, setFormData }: { formData: NurseFormData, setFormData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => (
    <FormLayout>
      <Fields.Select label="Type of Service" options={FORM_CONFIG.options.serviceTypes} value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} />
      <Fields.Select label="Shifting Pattern" options={FORM_CONFIG.options.shiftingPatterns} value={formData.shift_pattern} onChange={(e) => setFormData({ ...formData, shift_pattern: e.target.value })} />
      <Fields.Select label="Category of Staff" options={FORM_CONFIG.options.staffCategories} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
      <Fields.Input label="Medical Field Experience" placeholder="Enter years of experience" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
    </FormLayout>
  ),

  Health: ({ data, setData }: { data: NurseHealthData, setData: React.Dispatch<React.SetStateAction<NurseHealthData>> }) => (
    <FormLayout>
      <Fields.TextArea label="Current Health Status" placeholder="Enter current health status" value={data.health_status} onChange={(e) => setData({ ...data, health_status: e.target.value })} />
      <Fields.TextArea label="Disability Details" placeholder="Enter disability details if any" value={data.disability} onChange={(e) => setData({ ...data, disability: e.target.value })} />
      <Fields.Select label="Source of Information" options={FORM_CONFIG.options.sourceOfInformation} value={data.source} onChange={(e) => setData({ ...data, source: e.target.value })} />
    </FormLayout>
  )
};

export function AddStudentOverlay({ onClose, onAdd }: AddNurseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    aadhar: null,
    rationCard: null,
    education: null,
    experience: null,
    noc: null
  });

  const [nurseData, setNurseData] = useState<NurseFormData>({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    address: '',
    city: '',
    taluk: '',
    state: '',
    pin_code: '',
    phone_number: '',
    languages: [],
    noc_status: '', 
    service_type: '',
    shift_pattern: '',
    category: '',
    experience: '',
    marital_status: '',
    religion: '',
    mother_tongue: '',
    age: ''
  });
  
  const [referenceData, setReferenceData] = useState<NurseReferenceData>({
    reference_name: '',
    reference_phone: '',
    reference_relation: '',
    reference_address: '',
    recommendation_details: '',
    employer_name: '',
    employment_duration: '',
    employer_contact: '',
    family_references: [{
      name: '',
      relation: '',
      phone: ''
    }, {
      name: '',
      relation: '',
      phone: ''
    }] 
  });
  
  const [healthData, setHealthData] = useState<NurseHealthData>({
    health_status: '',
    disability: '',
    source: ''
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const submitData: BaseNurseFields = {
      firstName: nurseData.first_name,
      lastName: nurseData.last_name,
      email: '',
      location: `${nurseData.city}, ${nurseData.state}`,
      phoneNumber: nurseData.phone_number,
      gender: nurseData.gender,
      dob: nurseData.date_of_birth,
      experience: parseInt(nurseData.experience || '0'),
      preferredLocations: [],
      image: selectedImage
    };

    onAdd(submitData);
  };

  const renderStep = () => {
    const steps = {
      0: <StepContent.Personal formData={nurseData} setFormData={setNurseData} />,
      1: <StepContent.Contact formData={nurseData} setFormData={setNurseData} />,
      2: <StepContent.Reference data={referenceData} setData={setReferenceData} />,
      3: <StepContent.Work formData={nurseData} setFormData={setNurseData} />,
      4: <StepContent.Health data={healthData} setData={setHealthData} />,
      5: <StepContent.Document setDocuments={setDocuments} nurseData={nurseData} setNurseData={setNurseData} />
    };
    return steps[currentStep as keyof typeof steps] || null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Nurse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="shrink-0 px-6 pt-4">
          <div className="flex justify-between mb-4">
            {FORM_CONFIG.steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-1">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderStep()}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t px-6 py-4 bg-white mt-auto flex justify-between items-center rounded-b-2xl">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Step {currentStep + 1} of {FORM_CONFIG.steps.length}</span>
          <button
            onClick={() => currentStep === FORM_CONFIG.steps.length - 1 ? handleSubmit() : setCurrentStep(currentStep + 1)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
          >
            {currentStep === FORM_CONFIG.steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}