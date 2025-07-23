export type EnquiryFormData = {
  name: string;
  email: string;
  phone_no: string;
  course: string;
  age?: number;
  // dob?: string;
  // address?: string;
  gender?: string;
  // religion?: string;
  // caste?: string;
  // aadhaar_no?: string;
  // guardian_name?: string;
  // highest_qualification?: string;
  // year_of_passing?: number;
  message?: string;
};

export type EnquiryRecord = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone_no: string;
  course: string;
  // hide?: boolean;
  age?: number;
  // dob?: string;
  // address?: string;
  gender?: string;
  // religion?: string;
  // caste?: string;
  // aadhaar_no?: string;
  // guardian_name?: string;
  // highest_qualification?: string;
  // year_of_passing?: number;
  message?: string;
};

export type CoursesDB = {
  id: number;
  course_name: string;
  course_fees: number;
  reg_fees: number;
}

// Enhanced types for better enquiry handling
export type EnquiryFilters = {
  search?: string;
  course?: string;
  limit?: number;
  offset?: number;
};

export type EnquiryResponse = {
  success: boolean;
  data: EnquiryRecord[];
  totalCount: number;
  pagination: {
    limit: number | null;
    offset: number;
    hasMore: boolean;
  };
};
