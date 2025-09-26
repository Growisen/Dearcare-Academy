"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { getUserSession } from "../../../lib/auth";

interface Student {
  id: number;
  name: string;
  email: string;
  isIntern: boolean;
}
// interface OrganizationType {
//   c_organization_type: string;
// }
interface Organization {
  id: number;
  c_organization_name: string;
}
interface InternshipForm {
  organizationType: string;
  organizationId: number | null;
  startDate: string;
  endDate: string;
  notes: string;
}

export default function SupervisorInternshipPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<string[]>([]);
  // const [selectedOrgType, setSelectedOrgType] = useState<string>("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState<InternshipForm>({
    organizationType: "",
    organizationId: null,
    startDate: "",
    endDate: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supervisorId, setSupervisorId] = useState<number | null>(null);

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.role !== "supervisor") {
      router.push("/signin");
      return;
    }
    setSupervisorId(session.id);
    fetchStudents(session.id);
  }, []);

  async function fetchStudents(supervisorId?: number) {
    const id = supervisorId ?? supervisorId;
    if (!id) return;
    // Get assigned student IDs from supervisor_assignment
    const { data: assignments, error: assignmentError } = await supabase
      .from("supervisor_assignment")
      .select("student_id")
      .eq("supervisor_id", id);
    if (assignmentError) return setError(assignmentError.message);
    const studentIds = (assignments as { student_id: number }[] | null)?.map((a) => a.student_id) ?? [];
    if (studentIds.length === 0) {
      setStudents([]);
      return;
    }
    // Fetch students by IDs
    const { data, error } = await supabase
      .from("students")
      .select("id, name, email, internships(id, status)")
      .in("id", studentIds);
    if (error) return setError(error.message);
    setStudents(
      (data as (Student & { internships?: { id: number; status: string }[] })[] | null)?.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        isIntern: !!(s.internships && s.internships.some((i) => i.status === "active"))
      })) ?? []
    );
  }

  async function fetchOrganizationTypes() {
    const { data, error } = await supabase
      .from("corporate_organizations")
      .select("c_organization_type");
    if (error) return setError(error.message);
    setOrganizationTypes(
      Array.from(new Set((data as { c_organization_type: string }[] | null)?.map((o) => o.c_organization_type) ?? []))
    );
  }

  async function fetchOrganizationsByType(type: string) {
    const { data, error } = await supabase
      .from("corporate_organizations")
      .select("id, c_organization_name")
      .eq("c_organization_type", type);
    if (error) return setError(error.message);
    setOrganizations(data || []);
  }

  function openPromoteModal(student: Student) {
    setSelectedStudent(student);
    setShowModal(true);
    setForm({ organizationType: "", organizationId: null, startDate: "", endDate: "", notes: "" });
    fetchOrganizationTypes();
  }

  async function openDemoteModal(student: Student) {
    setLoading(true);
    setError(null);
    // Find active internship for this student
    const { data: internship, error } = await supabase
      .from("internships")
      .select("id")
      .eq("student_id", student.id)
      .eq("status", "active")
      .single();
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (internship && internship.id) {
      const { error: updateError } = await supabase
        .from("internships")
        .update({ status: "inactive" })
        .eq("id", internship.id);
      if (updateError) setError(updateError.message);
    }
    await fetchStudents(typeof supervisorId === 'number' ? supervisorId : undefined);
    setLoading(false);
  }

  async function handleOrgTypeSelect(type: string) {
    //setSelectedOrgType(type);
    setForm(f => ({ ...f, organizationType: type }));
    await fetchOrganizationsByType(type);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedStudent || !form.organizationId || !form.startDate) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("internships")
      .insert([
        {
          student_id: selectedStudent.id,
          organization_id: form.organizationId,
          start_date: form.startDate,
          end_date: form.endDate || null,
          status: "active",
          supervisor_notes: form.notes
        }
      ]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setShowModal(false);
    setSelectedStudent(null);
    // await fetchStudents();
    // router.refresh();
    await fetchStudents(supervisorId ?? undefined);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Internship Management</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Internship Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.isIntern ? "Internship Active" : "Not in Internship"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {!student.isIntern ? (
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => openPromoteModal(student)}
                    >
                      Promote Internship
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => openDemoteModal(student)}
                    >
                      Demote Internship
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Promote Internship Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Promote Internship for {selectedStudent?.name}</h2>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Organization Type */}
              {!form.organizationType && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Select Organization Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {organizationTypes.map(type => (
                      <button
                        type="button"
                        key={type}
                        className={`px-3 py-2 rounded bg-blue-100 text-blue-800 hover:bg-blue-200`}
                        onClick={() => handleOrgTypeSelect(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 2: Select Organization */}
              {form.organizationType && !form.organizationId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Select Organization</label>
                  <div className="grid grid-cols-1 gap-2">
                    {organizations.map(org => (
                      <button
                        type="button"
                        key={org.id}
                        className={`px-3 py-2 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200`}
                        onClick={() => setForm(f => ({ ...f, organizationId: org.id }))}
                      >
                        {org.c_organization_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 3: Dates and Notes */}
              {form.organizationType && form.organizationId && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Supervisor Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  {error && <div className="text-red-600 mb-2">{error}</div>}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded-lg"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
