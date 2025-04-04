export type EnquiryFormData = {
  name: string;
  email: string;
  phone_no: string;
  course: string;
};

export type CoursesDB = {
  id: number;
  course_name: string;
  course_fees: number;
  reg_fees: number;
}
