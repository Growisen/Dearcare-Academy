import { createClient } from '@supabase/supabase-js'
import {StudentFormData } from '../types/student.types'
import {EnquiryFormData } from '../types/enquiry.types'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Check connection status
supabase.auth.getSession()
  .then(() => {
    console.log('DB connected')
  })
  .catch((error) => {
    console.error('DB connection error:', error.message)
})


const uploadStudentFile = async (studentId: number, file: File, type: 'photo' | 'documents' | 'noc') => {
  // Convert photo to jpg if it's an image
  if (type === 'photo') {
    try {
      const imageBlob = await convertToJpg(file);
      const filePath = `Students/${studentId}/${type}.jpg`;
      
      const { error } = await supabase.storage
        .from('dearcare')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg'
        });

      if (error) throw error;
      return filePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to upload photo: ${errorMessage}`);
    }
  } else {
    // Handle other file types (documents and noc)
    const fileExt = file.name.split('.').pop();
    const filePath = `Students/${studentId}/${type}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('dearcare')
      .upload(filePath, file);

    if (error) throw error;
    return filePath;
  }
};

// Helper function to convert image to JPG
const convertToJpg = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert image'));
        },
        'image/jpeg',
        0.9
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Function to insert student data
export const insertStudentData = async (formData: StudentFormData): Promise<{
  studentId?: number;
  error: Error | null;
}> => {
  try {
    // Insert main student data first
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert([{
        name: formData.fullName,
        course: formData.course,  // Added this line
        dob: formData.dateOfBirth,
        age: parseInt(formData.age),
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        nationality: formData.nationality,
        state: formData.state,
        city: formData.city,
        taluk: formData.taluk,
        mother_tongue: formData.motherTongue,
        languages: formData.knownLanguages ? formData.knownLanguages.split(',').map(lang => lang.trim()) : [],
        religion: formData.religion,
        category: formData.category,
        email: formData.email,
        mobile: formData.mobileNumber,
        cur_address: formData.currentAddress,
        cur_pincode: formData.currentPinCode,
        perm_address: formData.permanentAddress,
        perm_pincode: formData.permanentPinCode,
        cur_health_status: formData.healthStatus,
        disability_details: formData.disability,
        noc_status: formData.nocStatus
      }])
      .select()
      .single();

    if (studentError) throw studentError;
    const studentId = studentData.id;

    // Upload files if they exist
    if (formData.photo) {
      await uploadStudentFile(studentId, formData.photo, 'photo');
    }
    
    if (formData.documents) {
      await uploadStudentFile(studentId, formData.documents, 'documents');
    }

    if (formData.nocStatus === 'Yes' && formData.nocCertificate) {
      await uploadStudentFile(studentId, formData.nocCertificate, 'noc');
    }

    // Insert academic records
    const academicPromises = Object.entries(formData.academics).map(([level, data]) => {
      return supabase.from('student_academics').insert({
        student_id: studentId,
        qualification: level === 'others' ? data.qualification : level,
        institution: data.institution,
        year_of_passing: parseInt(data.year),
        marks: data.grade  // Changed from grade to marks
      });
    });

    // Insert work experience
    const workPromise = supabase.from('student_experience').insert({
      student_id: studentId,
      org_name: formData.organization,
      role: formData.role,
      duration: parseInt(formData.duration), // Convert string to number
      responsibility: formData.responsibilities
    });

    // Insert guardian information
    const guardianPromise = supabase.from('student_guardian').insert({
      student_id: studentId,
      guardian_name: formData.guardianName,
      relation: formData.guardianRelation,
      mobile: formData.guardianContact,
      address: formData.guardianAddress,
      aadhaar: formData.guardianAadhar
    });

    // Insert service preferences with correct column mapping
    const preferencesData = {
      student_id: studentId,
      home_care: formData.servicePreferences['Home Care Assistant'] || '',
      delivery_care: formData.servicePreferences['Delivery Care Assistant'] || '',
      old_age_home: formData.servicePreferences['Old Age Home/Rehabilitation Center'] || '',
      hospital_care: formData.servicePreferences['Hospital Care'] || '',
      senior_citizen_assist: formData.servicePreferences['Senior Citizens Assistant'] || '',
      icu_home_care: formData.servicePreferences['ICU Home Care Assistant'] || '',
      critical_illness_care: formData.servicePreferences['Critical Illness Care Assistant'] || '',
      companionship: formData.servicePreferences['Companion Ship Assistant'] || '',
      clinical_assist: formData.servicePreferences['Clinical Assistant'] || ''
    };

    const { error: preferencesError } = await supabase
      .from('student_preferences')
      .insert([preferencesData]);

    if (preferencesError) throw preferencesError;

    // Insert source information
    const sourcePromise = supabase.from('student_source').insert({
      student_id: studentId,
      source_of_info: formData.sourceOfInformation,
      assigning_agent: formData.assigningAgent,
      priority: formData.priority,
      status: 'New', // Changed from formData.status to always be 'New'
      category: formData.sourceCategory,
      sub_category: formData.sourceSubCategory
    });

    // Execute all insertions in parallel
    await Promise.all([
      ...academicPromises,
      workPromise,
      guardianPromise,
      sourcePromise
    ]);

    return { studentId, error: null };
  } catch (error) {
    console.error('Error inserting student data:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const insertEnquiryData = async (formData: EnquiryFormData) => {
  try {
    // Prepare the data object with proper validation
    const enquiryData = {
      name: formData.name,
      email: formData.email,
      phone_no: formData.phone_no,
      course: formData.course,
      ...(formData.age && { age: formData.age }),
      // ...(formData.dob && { dob: formData.dob }),
      // ...(formData.address && { address: formData.address }),
      ...(formData.gender && { gender: formData.gender }),
      // ...(formData.religion && { religion: formData.religion }),
      // ...(formData.caste && { caste: formData.caste }),
      // ...(formData.aadhaar_no && { aadhaar_no: formData.aadhaar_no }),
      // ...(formData.guardian_name && { guardian_name: formData.guardian_name }),
      // ...(formData.highest_qualification && { highest_qualification: formData.highest_qualification }),
      // ...(formData.year_of_passing && { year_of_passing: formData.year_of_passing }),
      ...(formData.message && { message: formData.message }),
    };

    const { data, error } = await supabase
      .from('academy_enquiries')
      .insert([enquiryData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error inserting enquiry:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('academy_courses')
      .select('course_name');

    if (error) throw error;
    return { data: data.map(course => course.course_name), error: null };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getCourseDetails = async (courseName: string) => {
  try {
    const { data, error } = await supabase
      .from('academy_courses')
      .select('course_name, course_fees, reg_fees, first_installment, second_installment, third_installment')
      .eq('course_name', courseName)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching course details:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getVisibleEnquiries = async () => {
  try {
    const { data, error } = await supabase
      .from('academy_enquiries')
      .select('*')
      .or('hide.is.null,hide.eq.false')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const hideEnquiry = async (id: number) => {
  try {
    const { error } = await supabase
      .from('academy_enquiries')
      .update({ hide: true })
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error hiding enquiry:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getDashboardStats = async () => {
  try {
    const [facultyCount, studentCount, courseCount] = await Promise.all([
      supabase.from('academy_faculties').select('*', { count: 'exact' }),
      supabase.from('students').select('*', { count: 'exact' }),
      supabase.from('academy_courses').select('*', { count: 'exact' })
    ]);

    return {
      data: {
        facultyCount: facultyCount.count || 0,
        studentCount: studentCount.count || 0,
        courseCount: courseCount.count || 0,
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};
