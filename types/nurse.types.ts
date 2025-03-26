export interface NurseReview {
  id: string;
  text: string;
  date: string;
  rating: number;
  reviewer: string;
}

export interface Nurse {
  _id: string;
  firstName: string;
  lastName: string;
  location: string;
  status: 'assigned' | 'unassigned';
  email: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  salaryPerHour: number;
  hiringDate: string;
  experience: number;
  rating: number;
  reviews: NurseReview[];
  preferredLocations: string[];
}
