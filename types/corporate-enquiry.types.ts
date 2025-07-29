export type CorporateEnquiryFormData = {
  organization_type: string;
  organization_name: string;
  contact_person: string;
  designation: string;
  email: string;
  phone_no: string;
  staff_count: number;
  message?: string;
};

export type CorporateEnquiryRecord = {
  id: number;
  created_at: string;
  organization_type: string;
  organization_name: string;
  contact_person: string;
  designation: string;
  email: string;
  phone_no: string;
  staff_count: number;
  message?: string;
};

export type CorporateEnquiryFilters = {
  search?: string;
  organization_type?: string;
  limit?: number;
  offset?: number;
};

export type CorporateEnquiryResponse = {
  success: boolean;
  data: CorporateEnquiryRecord[];
  totalCount: number;
  pagination: {
    limit: number | null;
    offset: number;
    hasMore: boolean;
  };
};
