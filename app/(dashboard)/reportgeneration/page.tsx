"use client";
import React, { useEffect, useState } from "react";
import { getUserSession } from "@/lib/auth";
import { fetchStudentsWithBatch, fetchSupervisorStudents, fetchFullReport, upsertReportSections, replaceReportAssessments } from "@/lib/reportApi";
import { supabase } from "@/lib/supabase";
import ReportFormUI from "@/components/reports/ReportFormUI";

interface StudentRow {
  id: number;
  name: string;
  batch: string;
  reportExists: boolean;
  course?: string;
}

export default function ReportGenerationPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [initialReportData, setInitialReportData] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const user = getUserSession();
    if (user) {
      setRole(user.role);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      if (role === "admin") {
        const { data } = await fetchStudentsWithBatch();
        const studentsWithReportStatus = await Promise.all(
          (data || []).map(async (s: any) => {
            // Query student_reports for this student using Supabase client
            const { data: reportRow } = await supabase
              .from('student_reports')
              .select('id')
              .eq('student_id', s.id)
              .maybeSingle();
            return {
              id: s.id,
              name: s.name,
              batch: s.batch,
              course: s.course || "",
              reportExists: !!reportRow,
            };
          })
        );
        setStudents(studentsWithReportStatus);
      } else if (role === "supervisor" && userId) {
        const { data } = await fetchSupervisorStudents(userId);
        const studentsWithReportStatus = await Promise.all(
          (data || []).map(async (row: any) => {
            const s = row.students;
            const { data: reportRow } = await supabase
              .from('student_reports')
              .select('id')
              .eq('student_id', s.id)
              .maybeSingle();
            return {
              id: s.id,
              name: s.name,
              batch: s.batch,
              course: s.course || "",
              reportExists: !!reportRow,
            };
          })
        );
        setStudents(studentsWithReportStatus);
      }
      setLoading(false);
    }
    if (role) loadStudents();
  }, [role, userId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report Generation</h1>
      {loading ? (
        <div>Loading students...</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Batch</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="border px-2 py-1">{s.name}</td>
                <td className="border px-2 py-1">{s.batch}</td>
                <td className="border px-2 py-1">{s.reportExists ? "Report Exists" : "No Report"}</td>
                <td className="border px-2 py-1">
                  <button
                    className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    onClick={async () => {
                      setFormLoading(true);
                      setSelectedStudent(s);
                      if (s.reportExists) {
                        const data = await fetchFullReport(s.id);
                        setInitialReportData(data);
                      } else {
                        setInitialReportData(null);
                      }
                      setShowForm(true);
                      setFormLoading(false);
                    }}
                  >
                    {s.reportExists ? "Edit Report" : "Generate Report"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {role !== "admin" && role !== "supervisor" && (
        <div className="text-red-500 mt-4">Access denied.</div>
      )}
      {showForm && selectedStudent && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="relative">
            <ReportFormUI
              student={selectedStudent}
              initialData={initialReportData}
              onSubmit={async (data: any) => {
                setFormLoading(true);
                try {
                  // Sanitize assessment values (convert empty string to null or number)
                  const sanitizedAssessments = (data.assessments || []).map((a: any) => ({
                    ...a,
                    mark_scored: a.mark_scored === "" ? null : (a.mark_scored !== undefined ? Number(a.mark_scored) : null),
                    min_mark: a.min_mark === "" ? null : (a.min_mark !== undefined ? Number(a.min_mark) : null),
                    max_mark: a.max_mark === "" ? null : (a.max_mark !== undefined ? Number(a.max_mark) : null),
                    total_mark: a.total_mark === "" ? null : (a.total_mark !== undefined ? Number(a.total_mark) : null)
                  }));
                  // Upsert student_reports and all sections
                  const reportId = await upsertReportSections({
                    report: {
                      student_id: selectedStudent.id,
                      mark_assessment_duration: data.assessmentMeta.duration,
                      last_updated_at: new Date().toISOString(),
                      // creator_uid: (getUserSession()?.id || null), // If needed
                    },
                    performance: data.performance,
                    general: data.general,
                    academic: data.academic,
                    character: data.character,
                  });
                  // Replace all assessments
                  await replaceReportAssessments(reportId, sanitizedAssessments.map((a: any) => ({
                    ...a,
                    report_id: reportId
                  })));
                  setShowForm(false); // Auto-close modal immediately after save
                  // Refresh student list (after modal closes)
                  if (role === "admin") {
                    const { data } = await fetchStudentsWithBatch();
                    setStudents(
                      (data || []).map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        batch: s.batch,
                        course: s.course || "",
                        reportExists: !!(s.student_reports && s.student_reports.length > 0)
                      }))
                    );
                  } else if (role === "supervisor" && userId) {
                    const { data } = await fetchSupervisorStudents(userId);
                    setStudents(
                      (data || []).map((row: any) => {
                        const s = row.students;
                        return {
                          id: s.id,
                          name: s.name,
                          batch: s.batch,
                          course: s.course || "",
                          reportExists: !!(s.student_reports && s.student_reports.length > 0)
                        };
                      })
                    );
                  }
                } catch (e: any) {
                  alert("Failed to submit report: " + (e?.message || e));
                }
                setFormLoading(false);
              }}
              onCancel={() => setShowForm(false)}
            />
            {formLoading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
