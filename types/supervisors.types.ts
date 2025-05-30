export interface SupervisorDetailsProps {
    supervisor: {
        id: string;
        name: string;
        joinDate: string;
        department: string;
        status: "active" | "on_leave" | "inactive";
        email: string;
        phone: string;
        faculties?: any[];
        assignedStudents: AssignedStudent[];
    };
    onClose: () => void;
}

export interface DatabaseSupervisor {
  id: number;
  name: string;
  dob?: string;
  gender?: string;
  martialstatus?: string;
  email: string;
  phone_no: string;
  address?: string;
  join_date: string;
  department: string;
  role?: string;
}

export interface UnassignedStudent {
  id: number | string;
  name: string;
  email: string;
  course?: string;
}

export interface SupervisorAssignment {
    student_id: number;
    supervisor_id: number;
}

export interface AssignedStudent {
  id: number | string;
  name: string;
  email: string;
  student_source?: { status: string }[];
}
