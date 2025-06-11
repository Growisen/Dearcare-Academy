

export interface SupervisorDetailsProps {
    supervisor: {
        id: string;
        name: string;
        email: string;
        phone: string;
        department: string;
        joinDate: string;
        status: string;
        register_no?: string;
        assignedStudents: AssignedStudent[];
    };
    onClose: () => void;
}

export interface DatabaseSupervisor {
    id: bigint;
    created_at: string;
    name: string | null;
    join_date: string | null;
    department: string | null;
    email: string | null;
    phone_no: string | null;
    register_no: string | null;
}

export interface UnassignedStudent {
    id: number;
    name: string;
    course?: string;
    email?: string;
    register_no?: string;
}

export interface SupervisorAssignment {
    student_id: number;
    supervisor_id: number;
}

export interface AssignedStudent {
    id: number;
    name: string;
    email: string;
    register_no?: string;
    student_source?: {
        status: string;
    }[];
}
