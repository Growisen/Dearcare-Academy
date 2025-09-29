"use client";
import React, { useEffect, useState } from "react";
import { getUserSession } from "@/lib/auth";
import { fetchSupervisorStudents, fetchFullReport, upsertReportSections, replaceReportAssessments } from "@/lib/reportApi";
import ReportFormUI from "@/components/reports/ReportFormUI";

interface StudentRow {
  id: number;
  name: string;
  batch: string;
  reportExists: boolean;
  course?: string;
}

export default function SupervisorReportGenerationPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [initialReportData, setInitialReportData] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const user = getUserSession();
    if (user && user.role === "supervisor") {
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      if (userId) {
        const { data } = await fetchSupervisorStudents(userId);
        setStudents(
          (data || []).map((row: any) => {
            const s = row.students;
            return {
              id: s.id,
              name: s.name,
              batch: s.batch,
              reportExists: !!(s.student_reports && s.student_reports.length > 0)
            };
          })
        );
      }
      setLoading(false);
    }
    if (userId) loadStudents();
  }, [userId]);

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
      {userId === null && (
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
                  // Upsert student_reports and all sections
                  const reportId = await upsertReportSections({
                    report: {
                      student_id: selectedStudent.id,
                      mark_assessment_duration: data.assessmentMeta.duration,
                      last_updated_at: new Date().toISOString(),
                    },
                    performance: data.performance,
                    general: data.general,
                    academic: data.academic,
                    character: data.character,
                  });
                  // Replace all assessments
                  await replaceReportAssessments(reportId, data.assessments.map((a: any) => ({
                    ...a,
                    report_id: reportId
                  })));
                  setShowForm(false);
                  // Refresh student list
                  if (userId) {
                    const { data } = await fetchSupervisorStudents(userId);
                    setStudents(
                      (data || []).map((row: any) => {
                        const s = row.students;
                        return {
                          id: s.id,
                          name: s.name,
                          batch: s.batch,
                          reportExists: !!(s.student_reports && s.student_reports.length > 0)
                        };
                      })
                    );
                  }
                } catch (e) {
                  alert("Failed to submit report. Please try again.");
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
