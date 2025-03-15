export interface StudentFormData {
  fullName: string;
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
  academics: {
    sslc: { institution: string; year: string; grade: string };
    hsc: { institution: string; year: string; grade: string };
    gda: { institution: string; year: string; grade: string };
    others: { qualification: string; institution: string; year: string; grade: string };
  };
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

export interface AssignStudentOverlayProps {
  supervisorId: string;
  onClose: () => void;
  onAssign: (studentData: StudentFormData) => void;
}

export interface Faculty {
    id: string;
    name: string;
    subject: string;
    students: string[];
}

export interface SupervisorDetailsProps {
    supervisor: {
        id: string;
        name: string;
        email: string;
        phone: string;
        department: string;
        joinDate: string;
        status: string;
        faculties: Faculty[];
    };
    onClose: () => void;
}
