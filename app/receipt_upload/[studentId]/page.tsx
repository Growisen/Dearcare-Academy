import { supabase } from '@/app/lib/supabase';
import UploadForm from './UploadForm';

interface PageProps {
  params: { studentId: string }
}

export default async function Page({ params }: PageProps) {
  const { data: student } = await supabase
    .from('students')
    .select('name, email')
    .eq('id', params.studentId)
    .single();

  return <UploadForm studentId={params.studentId} studentName={student?.name} studentEmail={student?.email} />;
}
