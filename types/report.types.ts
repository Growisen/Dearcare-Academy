// Report-related enums
export type PerformanceRating = 'EXCELLENT' | 'GOOD' | 'AVERAGE';
export type FivePointRating = 'VERY_LOW' | 'LOW' | 'AVERAGE' | 'GOOD' | 'VERY_GOOD';
export type SubmissionStatus = 'ON_TIME' | 'LATE';
export type AssessmentType = 'THEORY' | 'WEEKLY' | 'PRACTICAL' | 'PROJECT' | 'ASSIGNMENT';

// Table types
export interface StudentReport {
  id: number;
  student_id: number;
  creator_uid: string | null;
  mark_assessment_duration: string | null;
  created_at: string;
  last_updated_at: string;
}

export interface ReportPerformance {
  id: number;
  report_id: number;
  home_care_assistant: PerformanceRating | null;
  delivery_care_assistant: PerformanceRating | null;
  old_age_home_rehab: PerformanceRating | null;
  hospital_care: PerformanceRating | null;
  senior_citizens_assistant: PerformanceRating | null;
  icu_home_care_assistant: PerformanceRating | null;
  critical_illness_care_assistant: PerformanceRating | null;
  companionship_assistant: PerformanceRating | null;
  clinical_assistant: PerformanceRating | null;
}

export interface ReportGeneralBehavior {
  id: number;
  report_id: number;
  study_time_attendance: string | null;
  complaints_while_studies: string | null;
  willing_to_cooperate: FivePointRating | null;
  follows_instruction: FivePointRating | null;
  shows_respect_for_authority: FivePointRating | null;
  considerate_towards_others: FivePointRating | null;
  mix_well_with_others: FivePointRating | null;
}

export interface ReportAcademicBehavior {
  id: number;
  report_id: number;
  focused_on_studies: FivePointRating | null;
  able_to_attend_independently: FivePointRating | null;
  complies_with_study_regulations: FivePointRating | null;
  willing_to_put_effort: FivePointRating | null;
  able_to_manage_time_well: FivePointRating | null;
}

export interface ReportCharacterLifestyle {
  id: number;
  report_id: number;
  display_neatness: FivePointRating | null;
  dress_appropriately: FivePointRating | null;
  maintain_good_classmate_relation: FivePointRating | null;
  shows_discipline_in_habits: FivePointRating | null;
  show_care_for_others: FivePointRating | null;
  adaptability_to_change: FivePointRating | null;
  show_maturity: FivePointRating | null;
  show_respectfulness: FivePointRating | null;
  show_leadership_qualities: FivePointRating | null;
}

export interface ReportAssessment {
  id: number;
  report_id: number;
  assessment_type: AssessmentType;
  topic: string | null;
  mark_scored: number | null;
  min_mark: number | null;
  max_mark: number | null;
  total_mark: number | null;
  practical_type: string | null;
  submission_date: string | null;
  last_date_of_submission: string | null;
  date_student_submitted: string | null;
  submission_status: SubmissionStatus | null;
}
