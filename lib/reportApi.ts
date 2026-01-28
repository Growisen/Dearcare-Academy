import { supabase } from './supabase';
import {
  StudentReport,
  ReportPerformance,
  ReportGeneralBehavior,
  ReportAcademicBehavior,
  ReportCharacterLifestyle,
  ReportAssessment,
  PerformanceRating,
  FivePointRating,
  SubmissionStatus,
  AssessmentType
} from '@/types/report.types';



// Fetch all students with batch (admin view)
export async function fetchStudentsWithBatch() {
  return supabase
    .from('students')
    .select('id, name, batch, course, student_reports(id)', { head: false })
    .not('batch', 'is', null);
}

// Fetch students assigned to a supervisor
export async function fetchSupervisorStudents(supervisorId: number) {
  return supabase
    .from('supervisor_assignment')
    .select('student_id, students(id, name, batch, course, student_reports(id))', { head: false })
    .eq('supervisor_id', supervisorId);
}

// Fetch all report data for a student_id
export async function fetchFullReport(studentId: number) {
  // Get report_id
  const { data: report } = await supabase
    .from('student_reports')
    .select('*')
    .eq('student_id', studentId)
    .single();
  if (!report) return null;
  const report_id = report.id;
  const [performance, general, academic, character, assessments] = await Promise.all([
    supabase.from('report_performance').select('*').eq('report_id', report_id).single(),
    supabase.from('report_general_behavior').select('*').eq('report_id', report_id).single(),
    supabase.from('report_academic_behavior').select('*').eq('report_id', report_id).single(),
    supabase.from('report_character_lifestyle').select('*').eq('report_id', report_id).single(),
    supabase.from('report_assessments').select('*').eq('report_id', report_id)
  ]);
  return {
    report,
    performance: performance.data,
    general: general.data,
    academic: academic.data,
    character: character.data,
    assessments: assessments.data || []
  };
}

// Upsert all report data (except assessments)
export async function upsertReportSections({
  report,
  performance,
  general,
  academic,
  character
}: {
  report: Partial<StudentReport>;
  performance: Partial<ReportPerformance>;
  general: Partial<ReportGeneralBehavior>;
  academic: Partial<ReportAcademicBehavior>;
  character: Partial<ReportCharacterLifestyle>;
}) {
  // Upsert student_reports
  const { data: reportData, error: reportError } = await supabase
    .from('student_reports')
    .upsert([report], { onConflict: 'student_id' })
    .select()
    .single();
  if (reportError) {
    console.error('Supabase student_reports upsert error:', reportError);
    throw reportError;
  }
  const report_id = reportData.id;
  // Upsert other sections
  const [perf, gen, acad, charac] = await Promise.all([
    supabase.from('report_performance').upsert([{ ...performance, report_id }], { onConflict: 'report_id' }),
    supabase.from('report_general_behavior').upsert([{ ...general, report_id }], { onConflict: 'report_id' }),
    supabase.from('report_academic_behavior').upsert([{ ...academic, report_id }], { onConflict: 'report_id' }),
    supabase.from('report_character_lifestyle').upsert([{ ...character, report_id }], { onConflict: 'report_id' })
  ]);
  [perf, gen, acad, charac].forEach(res => {
    if (res.error) {
      console.error('Supabase upsert error:', res.error);
      throw res.error;
    }
  });
  return report_id;
}

// Replace all assessments for a report_id
export async function replaceReportAssessments(report_id: number, assessments: Omit<ReportAssessment, 'id'>[]) {
  // Delete existing
  const { error: delError } = await supabase.from('report_assessments').delete().eq('report_id', report_id);
  if (delError) {
    console.error('Supabase delete assessments error:', delError);
    throw delError;
  }
  // Insert new
  if (assessments.length > 0) {
    const { error: insError } = await supabase.from('report_assessments').insert(
      assessments.map(a => ({ ...a, report_id }))
    );
    if (insError) {
      console.error('Supabase insert assessments error:', insError);
      throw insError;
    }
  }
}
