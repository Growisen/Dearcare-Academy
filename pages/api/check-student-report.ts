import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { student_id } = req.query;
  if (!student_id) {
    return res.status(400).json({ error: 'Missing student_id' });
  }
  const { data, error } = await supabase
    .from('student_reports')
    .select('*')
    .eq('student_id', student_id)
    .single();
  if (error || !data) {
    return res.status(200).json({ data: null });
  }
  res.status(200).json({ data });
}
