
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
