import { createClient } from '@supabase/supabase-js'
import { StudentFormData } from '../types/supervisors.types'
import { StudentInsertData, StudentRecord } from '../types/student.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Check connection status
supabase.auth.getSession()
  .then(() => {
    console.log('DB connected')
  })
  .catch((error) => {
    console.error('DB connection error:', error.message)
  })

const uploadStudentFile = async (studentId: number, file: File, type: 'photo' | 'documents') => {
  // Convert photo to jpg if it's an image
  if (type === 'photo') {
    try {
      const imageBlob = await convertToJpg(file);
      const filePath = `Students/${studentId}/${type}.jpg`;
      
      const { error } = await supabase.storage
        .from('DearCare')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg'
        });

      if (error) throw error;
      return filePath;
    } catch (error) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  } else {
    // Handle other file types as before
    const fileExt = file.name.split('.').pop();
    const filePath = `Students/${studentId}/${type}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('DearCare')
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
      status: formData.status,
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
