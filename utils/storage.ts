import { supabase } from '../lib/supabase';

export const getStudentFileUrl = async (studentId: number, fileType: 'photo' | 'documents' | 'noc') => {
  if (!studentId) {
    console.error('Invalid student ID provided');
    return null;
  }

  try {
    console.log(`Fetching ${fileType} for student ${studentId}`);
    
    const { data, error } = await supabase.storage
      .from('DearCare')
      .list(`Students/${studentId}`);

    if (error) {
      console.error('Storage list error:', {
        error,
        studentId,
        fileType,
        path: `Students/${studentId}`
      });
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No files found for student ${studentId}`);
      return null;
    }

    const file = data.find(f => f.name.startsWith(fileType));
    if (!file) {
      console.log(`${fileType} not found for student ${studentId}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('DearCare')
      .getPublicUrl(`Students/${studentId}/${file.name}`);

    return publicUrl;
  } catch (error) {
    console.error('Error accessing student files:', {
      error,
      studentId,
      fileType,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};

// Verify storage policy is working
export const verifyStorageAccess = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('DearCare')
      .list('');

    if (error) {
      console.error('Storage access error:', error.message);
      return false;
    }

    console.log('Storage access verified:', data);
    return true;
  } catch (error) {
    console.error('Storage access check failed:', error);
    return false;
  }
};
