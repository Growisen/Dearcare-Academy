"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
// Update the import path if your supabase client is located elsewhere, for example:
import { supabase } from "../../../lib/supabase";
// Or, if the file does not exist, create 'lib/supabase.ts' with the following content:
// import { createClient } from "@supabase/supabase-js";
// export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Organization {
  id: number;
  created_at: string;
  c_organization_type: string;
  c_organization_name: string;
  c_contact_person: string;
  c_designation: string;
  c_email: string;
  c_phone_no: string;
  c_staff_count: number | null;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    c_organization_type: "",
    c_organization_name: "",
    c_contact_person: "",
    c_designation: "",
    c_email: "",
    c_phone_no: "",
    c_staff_count: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { checkAuthStatus } = await import("../../../lib/auth");
      const currentUser = await checkAuthStatus();
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/signin");
        return;
      }
      setAuthChecked(true);
      fetchOrganizations();
    };
    checkAuth();
  }, [router]);

  async function fetchOrganizations() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("corporate_organizations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setOrganizations((data as Organization[]) || []);
    setLoading(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("corporate_organizations")
      .insert([
        {
          c_organization_type: form.c_organization_type,
          c_organization_name: form.c_organization_name,
          c_contact_person: form.c_contact_person,
          c_designation: form.c_designation,
          c_email: form.c_email,
          c_phone_no: form.c_phone_no,
          c_staff_count: form.c_staff_count ? Number(form.c_staff_count) : null
        }
      ]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setShowModal(false);
    setForm({
      c_organization_type: "",
      c_organization_name: "",
      c_contact_person: "",
      c_designation: "",
      c_email: "",
      c_phone_no: "",
      c_staff_count: ""
    });
    await fetchOrganizations();
    setLoading(false);
  }

  const filteredOrganizations = organizations.filter(org => {
    return (
      org.c_organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.c_contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.c_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.c_phone_no.includes(searchQuery)
    );
  });

  if (!authChecked) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add Corporate Organization
        </button>
      </div>
      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrganizations.map((org) => (
              <tr key={org.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(org.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_organization_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_organization_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_contact_person}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_designation}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_phone_no}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.c_staff_count}</td>
              </tr>
            ))}
            {filteredOrganizations.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">No organizations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Corporate Organization</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Organization Type</label>
                <input
                  type="text"
                  name="c_organization_type"
                  value={form.c_organization_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <input
                  type="text"
                  name="c_organization_name"
                  value={form.c_organization_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Contact Person</label>
                <input
                  type="text"
                  name="c_contact_person"
                  value={form.c_contact_person}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input
                  type="text"
                  name="c_designation"
                  value={form.c_designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="c_email"
                  value={form.c_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  name="c_phone_no"
                  value={form.c_phone_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Staff Count</label>
                <input
                  type="number"
                  name="c_staff_count"
                  value={form.c_staff_count}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
