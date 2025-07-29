'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CorporateEnquiryRecord } from '@/types/corporate-enquiry.types';
import { 
  Eye, EyeOff, User, Mail, Phone, Building, Calendar, 
  Users, Filter, Download, RefreshCw, Search,
  Clock, TrendingUp, BookOpen
} from 'lucide-react';

export default function CorporateEnquiryPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<CorporateEnquiryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<CorporateEnquiryRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizationTypeFilter, setOrganizationTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  // Helper function for DD:MM:YYYY
  function formatDateDMY(dateString: string | Date) {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}:${month}:${year}`;
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { checkAuthStatus } = await import('../../../../lib/auth');
      const currentUser = await checkAuthStatus();
      
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/signin');
        return;
      }

      setAuthChecked(true);
      loadEnquiries();
    };
    
    checkAuth();
  }, [router]);

  const loadEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/corporate-enquiry');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch corporate enquiries');
      }
      
      if (result.success && result.data) {
        setEnquiries(result.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this corporate enquiry? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/corporate-enquiry/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setEnquiries(enquiries.filter(e => e.id !== id));
      } else {
        setError('Failed to delete corporate enquiry');
      }
    } catch {
      setError('Failed to delete corporate enquiry');
    }
  };

  const handleViewDetails = (enquiry: CorporateEnquiryRecord) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  const handleExportData = () => {
    const csvContent = [
      // Header
      ['ID', 'Date', 'Organization Type', 'Organization Name', 'Contact Person', 'Designation', 'Email', 'Phone', 'Staff Count', 'Message'],
      // Data
      ...filteredEnquiries.map(enquiry => [
        enquiry.id,
        new Date(enquiry.created_at).toLocaleDateString(),
        enquiry.organization_type,
        enquiry.organization_name,
        enquiry.contact_person,
        enquiry.designation,
        enquiry.email,
        enquiry.phone_no,
        enquiry.staff_count,
        enquiry.message || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corporate-enquiries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter enquiries based on search term and multiple filters
  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.phone_no.includes(searchTerm) ||
                         enquiry.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrgType = organizationTypeFilter === '' || enquiry.organization_type === organizationTypeFilter;
    
    const matchesDate = dateFilter === '' || (
      dateFilter === 'today' ? new Date(enquiry.created_at).toDateString() === new Date().toDateString() :
      dateFilter === 'week' ? new Date(enquiry.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
      dateFilter === 'month' ? new Date(enquiry.created_at).getMonth() === new Date().getMonth() :
      dateFilter === 'year' ? new Date(enquiry.created_at).getFullYear() === new Date().getFullYear() : true
    );
    
    return matchesSearch && matchesOrgType && matchesDate;
  });

  // Get unique organization types for filters
  const uniqueOrgTypes = [...new Set(enquiries.map(e => e.organization_type))];

  // Calculate enhanced statistics
  const todayEnquiries = enquiries.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length;
  const weekEnquiries = enquiries.filter(e => new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const avgStaffCount = enquiries.reduce((acc, e) => acc + e.staff_count, 0) / enquiries.length || 0;

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  if (error && !loading) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 font-medium">Error loading corporate enquiries: {error}</div>
          <button 
            onClick={loadEnquiries}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!authChecked ? (
        <div className="p-8 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Loading...
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate Enquiry Management</h1>
            <p className="text-gray-600">Manage and review corporate collaboration enquiries</p>
          </div>

          {/* Enhanced Filters */}
          <div className="mb-6 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-blue-600" />
                  Search & Filters
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export CSV
                  </button>
                  <button
                    onClick={loadEnquiries}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {/* Basic Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by organization name, contact person, email, phone, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
                    <select
                      value={organizationTypeFilter}
                      onChange={(e) => setOrganizationTypeFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {uniqueOrgTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setOrganizationTypeFilter('');
                    setDateFilter('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Enquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{enquiries.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{todayEnquiries}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{weekEnquiries}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Org Types</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueOrgTypes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Avg Staff Req.</p>
                  <p className="text-2xl font-bold text-gray-900">{avgStaffCount > 0 ? Math.round(avgStaffCount) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading corporate enquiries...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Req.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{formatDateDMY(enquiry.created_at)}</div>
                            <div className="text-xs text-gray-500">{new Date(enquiry.created_at).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Building className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{enquiry.organization_name}</div>
                              <div className="text-sm text-gray-500">{enquiry.contact_person}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="truncate max-w-[150px]">{enquiry.email}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {enquiry.phone_no}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {enquiry.organization_type}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{enquiry.designation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {enquiry.staff_count} staff
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDetails(enquiry)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(enquiry.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEnquiries.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Corporate Enquiries Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || organizationTypeFilter || dateFilter ? 
                      'No corporate enquiries match your current filters. Try adjusting or clearing the filters.' : 
                      'No corporate enquiries have been submitted yet.'}
                  </p>
                  {(searchTerm || organizationTypeFilter || dateFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setOrganizationTypeFilter('');
                        setDateFilter('');
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {filteredEnquiries.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <span>Showing {startIndex + 1} to {Math.min(endIndex, filteredEnquiries.length)} of {filteredEnquiries.length} filtered results</span>
                      {filteredEnquiries.length !== enquiries.length && (
                        <span className="text-gray-500"> (from {enquiries.length} total)</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Details Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Corporate Enquiry Details</h3>
                  <p className="text-sm text-gray-500">ID: {selectedEnquiry.id} • Submitted on {formatDateDMY(selectedEnquiry.created_at)} {new Date(selectedEnquiry.created_at).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Organization Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      Organization Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.organization_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {selectedEnquiry.organization_type}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Required Staff Count</label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {selectedEnquiry.staff_count} healthcare professionals
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-green-600" />
                      Contact Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="text-sm text-gray-900 bg-white p-2 rounded border flex-1">{selectedEnquiry.contact_person}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.designation}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="text-sm text-gray-900 bg-white p-2 rounded border flex-1">{selectedEnquiry.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="text-sm text-gray-900 bg-white p-2 rounded border flex-1">{selectedEnquiry.phone_no}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Requirements & Additional Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-orange-600" />
                      Requirements & Additional Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requirements/Message</label>
                        <p className="text-sm text-gray-900 bg-white p-3 rounded border min-h-[100px]">
                          {selectedEnquiry.message || 'No additional requirements specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                      Submission Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Submission Date</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateDMY(selectedEnquiry.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Submission Time</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedEnquiry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Enquiry ID</span>
                        <span className="text-sm font-medium text-gray-900">#{selectedEnquiry.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedEnquiry.id);
                    setShowModal(false);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
