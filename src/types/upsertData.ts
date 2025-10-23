import { supabase } from '@/lib/supabaseClient';
import { type TableName } from './db';

export type data = {
  user_id: string;
  [key: string]: unknown;
};

const tableConstraints = {
  sessions: ['date', 'start_time', 'end_time'],
  chapters: [],
  goals: [],
};

export async function upsertData(table: TableName, data: data[]) {
  if (!data[0]?.user_id) return;

  const constraintCols = tableConstraints[table];
  const { error } = await supabase.from(table).upsert(
    data.map(row => ({
      ...row,
      updated_at: new Date().toISOString(),
    })),
    constraintCols.length > 0
      ? {
          onConflict: tableConstraints[table].join(','),
          ignoreDuplicates: false,
        }
      : { ignoreDuplicates: false }
  );
  if (error) {
    console.error('There was a problem signing up.', error);
    return { success: false, error };
  }
}
