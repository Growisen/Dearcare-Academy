'use client';

import { useEffect, useState } from 'react';
import { getVisibleEnquiries, hideEnquiry } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { EnquiryRecord } from '@/types/enquiry.types';
import { 
  Eye, EyeOff, User, Mail, Phone, GraduationCap, Calendar, MapPin, 
  Users, Filter, Download, RefreshCw, Search,
  UserCheck, Clock, TrendingUp, BookOpen
} from 'lucide-react';

export default function EnquiryPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

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
    const { data, error } = await getVisibleEnquiries();
    if (error) {
      setError(error.message);
    } else if (data) {
      setEnquiries(data);
    }
    setLoading(false);
  };

  const handleHide = async (id: number) => {
    const { error } = await hideEnquiry(id);
    if (!error) {
      setEnquiries(enquiries.filter(e => e.id !== id));
    } else {
      setError('Failed to hide enquiry');
    }
  };

  const handleViewDetails = (enquiry: EnquiryRecord) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  const handleExportData = () => {
    const csvContent = [
      // Header
      ['ID', 'Date', 'Name', 'Email', 'Phone', 'Course', 'Age', 'Gender', 'Address', 'Guardian', 'Qualification', 'Year of Passing', 'Religion', 'Caste', 'Aadhaar'],
      // Data
      ...filteredEnquiries.map(enquiry => [
        enquiry.id,
        new Date(enquiry.created_at).toLocaleDateString(),
        enquiry.name,
        enquiry.email,
        enquiry.phone_no,
        enquiry.course,
        enquiry.age || '',
        enquiry.gender || '',
        enquiry.address || '',
        enquiry.guardian_name || '',
        enquiry.highest_qualification || '',
        enquiry.year_of_passing || '',
        enquiry.religion || '',
        enquiry.caste || '',
        enquiry.aadhaar_no || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter enquiries based on search term and multiple filters
  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.phone_no.includes(searchTerm) ||
                         (enquiry.guardian_name && enquiry.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = courseFilter === '' || enquiry.course === courseFilter;
    
    const matchesAge = ageFilter === '' || (enquiry.age && 
      (ageFilter === '18-25' ? enquiry.age >= 18 && enquiry.age <= 25 :
       ageFilter === '26-35' ? enquiry.age >= 26 && enquiry.age <= 35 :
       ageFilter === '36-45' ? enquiry.age >= 36 && enquiry.age <= 45 :
       ageFilter === '46+' ? enquiry.age >= 46 : true));
    
    const matchesDate = dateFilter === '' || (
      dateFilter === 'today' ? new Date(enquiry.created_at).toDateString() === new Date().toDateString() :
      dateFilter === 'week' ? new Date(enquiry.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
      dateFilter === 'month' ? new Date(enquiry.created_at).getMonth() === new Date().getMonth() :
      dateFilter === 'year' ? new Date(enquiry.created_at).getFullYear() === new Date().getFullYear() : true
    );
    
    const matchesGender = genderFilter === '' || enquiry.gender === genderFilter;
    
    return matchesSearch && matchesCourse && matchesAge && matchesDate && matchesGender;
  });

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  // Get unique courses and genders for filters
  const uniqueCourses = [...new Set(enquiries.map(e => e.course))];
  const uniqueGenders = [...new Set(enquiries.map(e => e.gender).filter(Boolean))];

  // Calculate enhanced statistics
  const todayEnquiries = enquiries.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length;
  const weekEnquiries = enquiries.filter(e => new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const avgAge = enquiries.filter(e => e.age).reduce((acc, e) => acc + (e.age || 0), 0) / enquiries.filter(e => e.age).length || 0;
  const completedProfiles = enquiries.filter(e => e.age && e.dob && e.address && e.gender).length;

  if (error && !loading) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 font-medium">Error loading enquiries: {error}</div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enquiry Management</h1>
            <p className="text-gray-600">Manage and review student enquiries</p>
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
                    placeholder="Search by name, email, phone, or guardian name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Courses</option>
                      {uniqueCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                    <select
                      value={ageFilter}
                      onChange={(e) => setAgeFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Ages</option>
                      <option value="18-25">18-25 years</option>
                      <option value="26-35">26-35 years</option>
                      <option value="36-45">36-45 years</option>
                      <option value="46+">46+ years</option>
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Genders</option>
                      {uniqueGenders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCourseFilter('');
                    setAgeFilter('');
                    setDateFilter('');
                    setGenderFilter('');
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
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
                  <p className="text-sm text-gray-500">Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueCourses.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Complete Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{completedProfiles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Avg Age</p>
                  <p className="text-2xl font-bold text-gray-900">{avgAge > 0 ? Math.round(avgAge) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading enquiries...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{new Date(enquiry.created_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(enquiry.created_at).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                  {enquiry.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                              {enquiry.guardian_name && (
                                <div className="text-sm text-gray-500">Guardian: {enquiry.guardian_name}</div>
                              )}
                              {enquiry.gender && (
                                <div className="text-xs text-gray-400">{enquiry.gender}</div>
                              )}
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
                            {enquiry.course}
                          </span>
                          {enquiry.highest_qualification && (
                            <div className="text-xs text-gray-500 mt-1">{enquiry.highest_qualification}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {enquiry.age && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Age: {enquiry.age}
                              </span>
                            )}
                            {enquiry.dob && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                DOB: {new Date(enquiry.dob).toLocaleDateString()}
                              </span>
                            )}
                            {(!enquiry.age && !enquiry.dob) && (
                              <span className="text-xs text-gray-400">Incomplete</span>
                            )}
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
                            onClick={() => handleHide(enquiry.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Hide
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEnquiries.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Enquiries Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || courseFilter || ageFilter || dateFilter || genderFilter ? 
                      'No enquiries match your current filters. Try adjusting or clearing the filters.' : 
                      'No enquiries have been submitted yet.'}
                  </p>
                  {(searchTerm || courseFilter || ageFilter || dateFilter || genderFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCourseFilter('');
                        setAgeFilter('');
                        setDateFilter('');
                        setGenderFilter('');
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
                  <h3 className="text-2xl font-bold text-gray-900">Enquiry Details</h3>
                  <p className="text-sm text-gray-500">ID: {selectedEnquiry.id} • Submitted on {new Date(selectedEnquiry.created_at).toLocaleString()}</p>
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
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.age || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                          {selectedEnquiry.dob ? new Date(selectedEnquiry.dob).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.gender || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.religion || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.caste || 'Not provided'}</p>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-2" />
                          <p className="text-sm text-gray-900 bg-white p-2 rounded border flex-1">{selectedEnquiry.address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Course & Education */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                      Course & Education
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course of Interest</label>
                        <div className="bg-white p-3 rounded border">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {selectedEnquiry.course}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.highest_qualification || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.year_of_passing || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Guardian & Additional Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-orange-600" />
                      Additional Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedEnquiry.guardian_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                          {selectedEnquiry.aadhaar_no ? `**** **** ${selectedEnquiry.aadhaar_no.slice(-4)}` : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Completeness */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
                      Profile Status
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Basic Info', completed: !!(selectedEnquiry.name && selectedEnquiry.email && selectedEnquiry.phone_no) },
                        { label: 'Personal Details', completed: !!(selectedEnquiry.age && selectedEnquiry.dob && selectedEnquiry.gender) },
                        { label: 'Address', completed: !!selectedEnquiry.address },
                        { label: 'Education', completed: !!selectedEnquiry.highest_qualification },
                        { label: 'Guardian Info', completed: !!selectedEnquiry.guardian_name },
                        { label: 'Identity', completed: !!selectedEnquiry.aadhaar_no }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.completed ? '✓ Complete' : '✗ Missing'}
                          </span>
                        </div>
                      ))}
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
                    handleHide(selectedEnquiry.id);
                    setShowModal(false);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Hide Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
