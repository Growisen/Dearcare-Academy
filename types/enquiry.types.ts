export type EnquiryFormData = {
  name: string;
  email: string;
  phone_no: string;
  course: string;
};

export const COURSES = [
  "Advanced General Nursing Assistant (AGDA)",
  "Diploma in Healthcare Assistance",
  "Ayurveda Nursing & Baby Care"
] as const;
