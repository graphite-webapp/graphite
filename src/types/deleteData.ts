import { supabase } from '@/lib/supabaseClient';
import { type TableName } from './db';

export async function deleteData(table: TableName, id: number, userId: string) {
  const { error } = await supabase.from(table).delete().in('id', id).eq('user_id', userId);
  if (error) {
    console.error('There was a problem signing up.', error);
    return { success: false, error };
  }
}
