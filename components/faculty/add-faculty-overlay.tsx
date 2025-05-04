import React, { useState, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

type FormChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const FORM_CONFIG = {
  options: {
    gender: ['Male', 'Female', 'Other'],
    maritalStatus: ['Single', 'Married', 'Separated'],
  },
  styles: {
    input: 'w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200',
    label: 'block text-sm font-medium text-gray-700 mb-1',
    layout: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  },
};

interface FacultyFormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  department: string;
  role: string;
  photo: File | null;
  documents: Array<File | null>; // Updated to support multiple documents
  workExperience: Array<{
    organization: string;
    role: string;
    duration: string;
    responsibilities: string;
  }>;
}

export function AddFacultyOverlay({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FacultyFormData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    department: '',
    role: '',
    photo: null,
    documents: [null], // Initialize with one empty document
    workExperience: [
      {
        organization: '',
        role: '',
        duration: '',
        responsibilities: '',
      },
    ],
  });

  const handleFormChange = (field: keyof FacultyFormData) => (e: FormChangeEvent) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof FacultyFormData) => (file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleDocumentChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => {
      const updatedDocuments = [...prev.documents];
      updatedDocuments[index] = file;
      return { ...prev, documents: updatedDocuments };
    });
  };

  const addWorkExperience = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { organization: '', role: '', duration: '', responsibilities: '' },
      ],
    }));
  };

  const addDocumentField = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, null],
    }));
  };

  const handleWorkExperienceChange = (index: number, field: keyof FacultyFormData['workExperience'][0]) => (e: FormChangeEvent) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updatedWorkExperience = [...prev.workExperience];
      updatedWorkExperience[index][field] = value;
      return { ...prev, workExperience: updatedWorkExperience };
    });
  };

  const handleSubmit = async () => {
    try {
      // Step 1: Insert data into "academy_faculties" table
      const { data: facultyData, error: facultyError } = await supabase
        .from('academy_faculties')
        .insert({
          name: formData.fullName,
          dob: formData.dateOfBirth,
          gender: formData.gender,
          martialstatus: formData.maritalStatus,
          email: formData.email,
          phone_no: formData.phone,
          address: formData.address,
          join_date: formData.joinDate,
          department: formData.department,
          role: formData.role,
        })
        .select('id') // Select the "id" column to get the unique faculty ID
        .single();

      if (facultyError) {
        toast.error('Error adding faculty: ' + facultyError.message);
        return;
      }

      const facultyId = facultyData.id; // Get the unique faculty ID

      // Step 2: Insert work experience into "faculty_experiences" table
      const workExperienceData = formData.workExperience.map((experience) => ({
        faculty_id: facultyId, // Use the foreign key
        organization: experience.organization,
        posted_role: experience.role,
        duration: experience.duration,
        responsibilities: experience.responsibilities,
      }));

      const { error: experienceError } = await supabase
        .from('faculty_experiences')
        .insert(workExperienceData);

      if (experienceError) {
        toast.error('Error adding work experience: ' + experienceError.message);
        return;
      }

      // Step 3: Upload files to Supabase storage
      const folderName = `Faculties/${facultyId}`; // Folder named after faculty_id inside "Faculties"
      const photoPath = `${folderName}/photo.jpg`; // Path for the photo

      // Upload the photo
      if (formData.photo) {
        const { error: photoError } = await supabase.storage
          .from('DearCare')
          .upload(photoPath, formData.photo);

        if (photoError) {
          toast.error('Error uploading photo: ' + photoError.message);
          return;
        }
      }

      // Create a "certificate" folder and upload documents
      const certificateFolder = `${folderName}/certificate`; // Path for the certificate folder
      await Promise.all(
        formData.documents.map(async (document, index) => {
          if (document) {
            const documentPath = `${certificateFolder}/${index + 1}.pdf`; // Name documents as 1.pdf, 2.pdf, etc.
            const { error: documentError } = await supabase.storage
              .from('DearCare')
              .upload(documentPath, document);

            if (documentError) {
              throw documentError;
            }
          }
        })
      );

      // Success message
      toast.success('Faculty added successfully!');
      onClose();
    } catch (err) {
      console.error('Error:', err);
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Faculty</h2>
            <p className="text-sm text-gray-500">Fill in the faculty details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className={FORM_CONFIG.styles.layout}>
              <div>
                <label className={FORM_CONFIG.styles.label}>Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleFormChange('fullName')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange('dateOfBirth')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={handleFormChange('gender')}
                  className={FORM_CONFIG.styles.input}
                >
                  <option value="">Select gender</option>
                  {FORM_CONFIG.options.gender.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={handleFormChange('maritalStatus')}
                  className={FORM_CONFIG.styles.input}
                >
                  <option value="">Select marital status</option>
                  {FORM_CONFIG.options.maritalStatus.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className={FORM_CONFIG.styles.layout}>
              <div>
                <label className={FORM_CONFIG.styles.label}>Email</label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleFormChange('email')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Phone</label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleFormChange('phone')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Address</label>
                <textarea
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleFormChange('address')}
                  className={FORM_CONFIG.styles.input}
                  rows={3}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">Current Information</h3>
            <div className={FORM_CONFIG.styles.layout}>
              <div>
                <label className={FORM_CONFIG.styles.label}>Join Date</label>
                <Input
                  type="date"
                  placeholder="Enter join date"
                  value={formData.joinDate}
                  onChange={handleFormChange('joinDate')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Department</label>
                <Input
                  type="text"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={handleFormChange('department')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
              <div>
                <label className={FORM_CONFIG.styles.label}>Role</label>
                <Input
                  type="text"
                  placeholder="Enter role"
                  value={formData.role}
                  onChange={handleFormChange('role')}
                  className={FORM_CONFIG.styles.input}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              Work Experience
              <button
                type="button"
                onClick={addWorkExperience}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add More
              </button>
            </h3>
            {formData.workExperience.map((experience, index) => (
              <div key={index} className={FORM_CONFIG.styles.layout}>
                <div>
                  <label className={FORM_CONFIG.styles.label}>Organization</label>
                  <Input
                    type="text"
                    placeholder="Enter organization"
                    value={experience.organization}
                    onChange={handleWorkExperienceChange(index, 'organization')}
                    className={FORM_CONFIG.styles.input}
                  />
                </div>
                <div>
                  <label className={FORM_CONFIG.styles.label}>Posted Role</label> {/* Updated label */}
                  <Input
                    type="text"
                    placeholder="Enter posted role" 
                    value={experience.role}
                    onChange={handleWorkExperienceChange(index, 'role')}
                    className={FORM_CONFIG.styles.input}
                  />
                </div>
                <div>
                  <label className={FORM_CONFIG.styles.label}>Duration</label>
                  <Input
                    type="text"
                    placeholder="Enter duration"
                    value={experience.duration}
                    onChange={handleWorkExperienceChange(index, 'duration')}
                    className={FORM_CONFIG.styles.input}
                  />
                </div>
                <div>
                  <label className={FORM_CONFIG.styles.label}>Responsibilities</label>
                  <textarea
                    placeholder="Enter responsibilities"
                    value={experience.responsibilities}
                    onChange={handleWorkExperienceChange(index, 'responsibilities')}
                    className={FORM_CONFIG.styles.input}
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
            <div className="space-y-4">
              <div>
                <label className={FORM_CONFIG.styles.label}>Upload Photo</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('photo')(e.target.files?.[0] || null)}
                  className="text-sm"
                />
              </div>

              {formData.documents.map((document, index) => (
                <div key={index}>
                  <label className={FORM_CONFIG.styles.label}>
                    Upload Document {index + 1}
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleDocumentChange(index)}
                    className="text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addDocumentField}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add More
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4 bg-white mt-auto flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}