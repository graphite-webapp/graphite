import { supabase } from '@/lib/supabaseClient';
import { type TableName } from './db';

export type data = {
  user_id: string;
  [key: string]: unknown;
};

const tableConstraints = {
  sessions: ['date', 'start_time', 'end_time'],
  chapters: ['date'],
  goals: [],
  profiles: ['user_id'],
  settings: [],
};

export async function upsertData(table: TableName, data: data[], hasConstraints: boolean = false) {
  if (!data[0]?.user_id) return;

  let constraintCols = [];
  if (hasConstraints) {
    constraintCols = tableConstraints[table];
  }
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

export async function upsertAvatar(userId, file) {
  const folderPath = `${userId}/`;
  const filePath = `${folderPath}${Date.now()}-avatar`;

  try {
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('avatars')
      .list(folderPath);

    if (listError) throw listError;

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${folderPath}${f.name}`);
      const { error: deleteError } = await supabase.storage.from('avatars').remove(filesToDelete);

      if (deleteError) console.warn('Failed to delete some files:', deleteError.message);
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    return publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Failed to upload image');
  }
}
