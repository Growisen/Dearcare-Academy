export interface Student {
  id: string;
  fullName: string;
  course: string;
  status: "confirmed" | "follow-up" | "new" | "rejected";
  email: string;
  phone: string;
  enrollmentDate: string;
  location: string;
  register_no?: string;
  batch?: string;
  roll_no?: number;
}

export interface DatabaseStudent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  course: string;
  payment_receipt: boolean;
  created_at: string;
  register_no?: string;
  status?: string;
  city?: string;
  state?: string;
  batch?: string;
  roll_no?: number;
  student_source?: {
    status: string;
    priority: string;
  }[];
  student_preferences?: {
    home_care: string;
    delivery_care: string;
    old_age_home: string;
    hospital_care: string;
    senior_citizen_assist: string;
    icu_home_care: string;
    critical_illness_care: string;
    companionship: string;
    clinical_assist: string;
  }[];
}

export interface StudentRecord {
  id?: bigint;
  created_at?: string;
  name: string;
  course: string;  
  dob: string;
  age: number;
  gender: string;
  marital_status: string;
  nationality: string;
  state: string;
  city: string;
  taluk: string;
  mother_tongue: string;
  languages: string[];
  religion: string;
  category: string;
  email: string;
  mobile: string;
  cur_address: string;
  cur_pincode: string;
  perm_address: string;
  perm_pincode: string;
  cur_health_status: string;
  disability_details: string;
  noc_status: string;
  payment_receipt?: boolean;
  batch?: string;
  roll_no?: number;
}

export type StudentInsertData = Omit<StudentRecord, 'id' | 'created_at'>;

export interface StudentAcademics {
  id?: bigint;
  created_at?: string;
  student_id: bigint;
  qualification: string;
  institution: string;
  year_of_passing: number; 
  marks: string; 
}

export interface StudentWorkExperience {
  id?: bigint;
  created_at?: string;
  student_id: bigint;
  org_name: string;
  role: string;
  duration: number; 
  responsibility: string;
}

export interface StudentGuardian {
  id?: bigint;
  created_at?: string;
  student_id: bigint;
  guardian_name: string;
  relation: string;
  mobile: string;
  address: string;
  aadhaar: string;
}

export interface StudentServicePreference {
  id?: number;
  student_id: number;
  service_name: string;
  interest_level: string;
  created_at?: string;
}

export interface StudentPreferences {
  id?: bigint;
  created_at?: string;
  student_id: bigint;
  home_care: string;
  delivery_care: string;
  old_age_home: string;
  hospital_care: string;
  senior_citizen_assist: string;
  icu_home_care: string;
  critical_illness_care: string;
  companionship: string;
  clinical_assist: string;
}

export interface StudentSource {
  id?: bigint;
  created_at?: string;
  student_id: bigint;
  source_of_info: string;
  assigning_agent: string;
  priority: string;
  status: string;
  category: string;
  sub_category: string;
}

export interface AcademicInfo {
  institution: string;
  year: string;
  grade: string;
  qualification?: string;
}

export interface AcademicsData {
  sslc: AcademicInfo;
  hsc: AcademicInfo;
  gda: AcademicInfo;
  others: AcademicInfo;
}

export interface StudentFormData {
  fullName: string;
  course: string; 
  dateOfBirth: string;
  age: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  state: string;
  city: string;
  taluk: string;
  motherTongue: string;
  knownLanguages: string;
  religion: string;
  category: string;
  email: string;
  mobileNumber: string;
  currentAddress: string;
  currentPinCode: string;
  permanentAddress: string;
  permanentPinCode: string;
  academics: AcademicsData;
  organization: string;
  role: string;
  duration: string;
  responsibilities: string;
  guardianName: string;
  guardianRelation: string;
  guardianContact: string;
  guardianAddress: string;
  guardianAadhar: string;
  healthStatus: string;
  disability: string;
  photo: File | null;
  documents: File | null;
  nocStatus: string;
  nocCertificate: File | null;
  sourceOfInformation: string;
  assigningAgent: string;
  priority: string;
  status: string;
  sourceCategory: string;
  sourceSubCategory: string;
  servicePreferences: Record<string, string>;
}

export interface StepContentProps {
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}

export interface AddStudentOverlayProps {
  supervisorId: string;
  onClose: () => void;
  onAssign: (studentData: StudentFormData) => void;
}

// Add this new interface for the overlay
export interface StudentDetailsProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  requestDate: string;
  status: "confirmed" | "follow-up" | "new" | "rejected";
  location: string;
  dateOfBirth: string; // New property
  age: string;         // New property
  gender: string;      // New property
}

