import React, { useEffect, useState } from "react";
import { getUserSession } from "@/lib/auth";
import { fetchFullReport } from "@/lib/reportApi";

export default function StudentReportView() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserSession();
    if (!user || user.role !== "student") {
      setError("Access denied.");
      setLoading(false);
      return;
    }
    fetchFullReport(user.id).then((data) => {
      setReportData(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Loading report...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!reportData) return <div className="p-6">Your performance report is not yet available.</div>;

  const { report, performance, general, academic, character, assessments } = reportData;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Performance Report</h1>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Performance in Similar Area</h2>
        <ul className="grid grid-cols-2 gap-2">
          {performance && Object.entries(performance).filter(([k]) => k !== "id" && k !== "report_id").map(([k, v]) => (
            <li key={k}><span className="font-medium capitalize">{k.replace(/_/g, " ")}: </span>{(typeof v === 'string' || typeof v === 'number') ? v : (v ? String(v) : "-")}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">General Behavior</h2>
        <ul className="grid grid-cols-2 gap-2">
          {general && Object.entries(general).filter(([k]) => k !== "id" && k !== "report_id").map(([k, v]) => (
            <li key={k}><span className="font-medium capitalize">{k.replace(/_/g, " ")}: </span>{(typeof v === 'string' || typeof v === 'number') ? v : (v ? String(v) : "-")}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Academic Behavior</h2>
        <ul className="grid grid-cols-2 gap-2">
          {academic && Object.entries(academic).filter(([k]) => k !== "id" && k !== "report_id").map(([k, v]) => (
            <li key={k}><span className="font-medium capitalize">{k.replace(/_/g, " ")}: </span>{(typeof v === 'string' || typeof v === 'number') ? v : (v ? String(v) : "-")}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Character & Lifestyle</h2>
        <ul className="grid grid-cols-2 gap-2">
          {character && Object.entries(character).filter(([k]) => k !== "id" && k !== "report_id").map(([k, v]) => (
            <li key={k}><span className="font-medium capitalize">{k.replace(/_/g, " ")}: </span>{(typeof v === 'string' || typeof v === 'number') ? v : (v ? String(v) : "-")}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Mark Assessments</h2>
        {assessments && assessments.length > 0 ? (
          <table className="min-w-full border text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Topic</th>
                <th className="border px-2 py-1">Mark Scored</th>
                <th className="border px-2 py-1">Min</th>
                <th className="border px-2 py-1">Max</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Practical Type</th>
                <th className="border px-2 py-1">Submission Date</th>
                <th className="border px-2 py-1">Last Date</th>
                <th className="border px-2 py-1">Student Submitted</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{a.assessment_type}</td>
                  <td className="border px-2 py-1">{a.topic}</td>
                  <td className="border px-2 py-1">{a.mark_scored}</td>
                  <td className="border px-2 py-1">{a.min_mark}</td>
                  <td className="border px-2 py-1">{a.max_mark}</td>
                  <td className="border px-2 py-1">{a.total_mark}</td>
                  <td className="border px-2 py-1">{a.practical_type}</td>
                  <td className="border px-2 py-1">{a.submission_date}</td>
                  <td className="border px-2 py-1">{a.last_date_of_submission}</td>
                  <td className="border px-2 py-1">{a.date_student_submitted}</td>
                  <td className="border px-2 py-1">{a.submission_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No assessments available.</div>
        )}
      </div>
    </div>
  );
}
