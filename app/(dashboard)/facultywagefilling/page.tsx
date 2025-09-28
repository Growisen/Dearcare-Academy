"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

// Removed unused Faculty interface
interface Wage {
  id: number;
  faculty_id: number;
  wage_amount: number | null;
  is_paid: boolean;
  last_updated_at: string;
  created_at: string;
}
interface RowData {
  facultyId: number;
  facultyName: string;
  wageAmount: number | "";
  isPaid: boolean;
  wageId?: number;
  status: "Not Set" | "Pending" | "Paid";
}

export default function FacultyWageFillingPage() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [originalRows, setOriginalRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data: faculties, error: facError } = await supabase
        .from("academy_faculties")
        .select("id, name");
      if (facError) throw facError;
      const { data: wages, error: wageError } = await supabase
        .from("faculty_wages")
        .select("id, faculty_id, wage_amount, is_paid, last_updated_at, created_at");
      if (wageError) throw wageError;
      const wageMap = new Map<number, Wage>();
      (wages || []).forEach((w) => wageMap.set(w.faculty_id, w));
      const combined: RowData[] = (faculties || []).map((f) => {
        const wage = wageMap.get(f.id);
        let status: RowData["status"] = "Not Set";
        if (wage) {
          if (wage.wage_amount == null) status = "Not Set";
          else if (wage.is_paid) status = "Paid";
          else status = "Pending";
        }
        return {
          facultyId: f.id,
          facultyName: f.name,
          wageAmount: wage?.wage_amount ?? "",
          isPaid: wage?.is_paid ?? false,
          wageId: wage?.id,
          status,
        };
      });
      setRows(combined);
      setOriginalRows(JSON.parse(JSON.stringify(combined)));
    } catch {
      setError("Failed to fetch faculty or wage data. Please try again.");
    }
    setLoading(false);
  }

  function handleInputChange(idx: number, value: string) {
    setRows((prev) => {
      const updated = [...prev];
      updated[idx].wageAmount = value === "" ? "" : Number(value);
      updated[idx].status =
        value === "" ? "Not Set" : updated[idx].isPaid ? "Paid" : "Pending";
      return updated;
    });
  }
  function handlePaidChange(idx: number, checked: boolean) {
    setRows((prev) => {
      const updated = [...prev];
      updated[idx].isPaid = checked;
      updated[idx].status =
        updated[idx].wageAmount === "" ? "Not Set" : checked ? "Paid" : "Pending";
      return updated;
    });
  }
  function hasUnsavedChanges() {
    return rows.some((row, i) =>
      row.wageAmount !== originalRows[i]?.wageAmount ||
      row.isPaid !== originalRows[i]?.isPaid
    );
  }

  async function handleSaveAll() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updates = rows.filter((row, i) =>
        row.wageAmount !== originalRows[i]?.wageAmount ||
        row.isPaid !== originalRows[i]?.isPaid
      );
      for (const row of updates) {
        if (row.wageAmount === "") continue;
        const { error } = await supabase
          .from("faculty_wages")
          .upsert({
            faculty_id: row.facultyId,
            wage_amount: row.wageAmount,
            is_paid: row.isPaid,
            last_updated_at: new Date().toISOString(),
          }, { onConflict: "faculty_id" });
        if (error) throw error;
      }
      setSuccess("All changes saved successfully.");
      await fetchData();
    } catch {
        setError("Failed to save changes. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Faculty Wage Filling</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading faculty and wage data...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow p-4 mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wage Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, idx) => (
                  <tr key={row.facultyId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.facultyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min={0}
                        className="w-32 px-2 py-1 border rounded"
                        value={row.wageAmount}
                        onChange={e => handleInputChange(idx, e.target.value)}
                        disabled={saving}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={row.isPaid}
                        onChange={e => handlePaidChange(idx, e.target.checked)}
                        disabled={saving}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        row.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : row.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges() || saving}
            >
              {saving && (
                <span className="loader mr-2 w-4 h-4 border-2 border-white border-t-blue-600 rounded-full animate-spin"></span>
              )}
              Save All Changes
            </button>
          </div>
          {success && (
            <div className="mt-4 text-green-700 text-center font-semibold">{success}</div>
          )}
        </>
      )}
    </div>
  );
}
