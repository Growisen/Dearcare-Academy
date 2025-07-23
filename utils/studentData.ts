import { supabase } from '../lib/supabase';
import { getStudentFileUrl } from './storage';
import { StudentAcademics, StudentPreferences } from '../types/student.types';

// Define academic accumulator type
interface AcademicRecord {
  institution: string;
  year: string;
  grade: string;
}

interface AcademicsAccumulator {
  sslc: AcademicRecord;
  hsc: AcademicRecord;
  gda: AcademicRecord;
  others: AcademicRecord;
  [key: string]: AcademicRecord;
}

export const fetchStudentData = async (studentId: string) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    // Log the attempt
    console.log('Attempting to fetch student data:', studentId);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        student_academics (*),
        student_experience (*),
        student_guardian (*),
        student_preferences (*),
        student_source!student_source_student_id_fkey (*)
      `)
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('Supabase query error:', JSON.stringify(studentError, null, 2));
      throw studentError;
    }

    if (!student) {
      throw new Error(`No student found with ID: ${studentId}`);
    }

    // Log successful data fetch
    console.log('Successfully fetched student data');

    // Fetch document URLs with error handling
    const [photoUrl, documentsUrl, nocUrl] = await Promise.all([
      getStudentFileUrl(Number(studentId), 'photo').catch(err => {
        console.error('Error fetching photo URL:', err);
        return null;
      }),
      getStudentFileUrl(Number(studentId), 'documents').catch(err => {
        console.error('Error fetching documents URL:', err);
        return null;
      }),
      getStudentFileUrl(Number(studentId), 'noc').catch(err => {
        console.error('Error fetching NOC URL:', err);
        return null;
      })
    ]);

    // Transform the data to match the component's expected format
    const transformedData = {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.mobile,
      register_no: student.register_no,
      batch: student.batch,
      roll_no: student.roll_no,
      dateOfBirth: student.dob,
      age: student.age?.toString(),
      gender: student.gender,
      maritalStatus: student.marital_status,
      nationality: student.nationality,
      state: student.state,
      city: student.city,
      taluk: student.taluk,
      motherTongue: student.mother_tongue,
      knownLanguages: student.languages?.join(', '),
      religion: student.religion,
      category: student.category,
      currentAddress: student.cur_address,
      currentPinCode: student.cur_pincode,
      permanentAddress: student.perm_address,
      permanentPinCode: student.perm_pincode,
      healthStatus: student.cur_health_status,
      disability: student.disability_details,
      nocStatus: student.noc_status,
      photo: photoUrl,
      documents: documentsUrl,
      nocCertificate: nocUrl,
        // Transform academics
      academics: student.student_academics?.reduce((acc: AcademicsAccumulator, curr: StudentAcademics) => {
        const level = curr.qualification.toLowerCase();
        acc[level] = {
          institution: curr.institution,
          year: curr.year_of_passing?.toString() || '',
          grade: curr.marks
        };
        return acc;
      }, {
        sslc: { institution: '', year: '', grade: '' },
        hsc: { institution: '', year: '', grade: '' },
        gda: { institution: '', year: '', grade: '' },
        others: { institution: '', year: '', grade: '' }
      }),

      // Work experience
      organization: student.student_experience?.[0]?.org_name,
      role: student.student_experience?.[0]?.role,
      duration: student.student_experience?.[0]?.duration?.toString(),
      responsibilities: student.student_experience?.[0]?.responsibility,

      // Guardian information
      guardianName: student.student_guardian?.[0]?.guardian_name,
      guardianRelation: student.student_guardian?.[0]?.relation,
      guardianContact: student.student_guardian?.[0]?.mobile,
      guardianAddress: student.student_guardian?.[0]?.address,
      guardianAadhar: student.student_guardian?.[0]?.aadhaar,

      // Source information
      sourceOfInformation: student.student_source?.[0]?.source_of_info,
      assigningAgent: student.student_source?.[0]?.assigning_agent,
      status: student.student_source?.[0]?.status,
      priority: student.student_source?.[0]?.priority,
      sourceCategory: student.student_source?.[0]?.category,
      sourceSubCategory: student.student_source?.[0]?.sub_category,      // Service preferences
      servicePreferences: student.student_preferences?.reduce((acc: Record<string, string>, pref: StudentPreferences) => {
        acc['Home Care Assistant'] = pref.home_care;
        acc['Delivery Care Assistant'] = pref.delivery_care;
        acc['Old Age Home/Rehabilitation Center'] = pref.old_age_home;
        acc['Hospital Care'] = pref.hospital_care;
        acc['Senior Citizens Assistant'] = pref.senior_citizen_assist;
        acc['ICU Home Care Assistant'] = pref.icu_home_care;
        acc['Critical Illness Care Assistant'] = pref.critical_illness_care;
        acc['Companion Ship Assistant'] = pref.companionship;
        acc['Clinical Assistant'] = pref.clinical_assist;
        return acc;
      }, {}),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    // Enhanced error logging
    console.error('Error in fetchStudentData:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      studentId
    });
    
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error(JSON.stringify(error) || 'Unknown error occurred while fetching student data')
    };
  }
};
