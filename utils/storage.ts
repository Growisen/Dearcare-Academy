import { supabase } from '../app/lib/supabase';

export const getStudentFileUrl = async (studentId: number, fileType: 'photo' | 'documents' | 'noc') => {
  // Can only access specific student folder
  try {
    const { data, error } = await supabase.storage
      .from('DearCare')
      .list(`Students/${studentId}`);

    if (error) throw error;

    const file = data?.find(f => f.name.startsWith(fileType));
    if (!file) return null;

    const { data: { publicUrl } } = supabase.storage
      .from('DearCare')
      .getPublicUrl(`Students/${studentId}/${file.name}`);

    return publicUrl;
  } catch (error) {
    console.error('Error accessing student files:', error);
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
