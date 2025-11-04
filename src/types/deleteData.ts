import { supabase } from '@/lib/supabaseClient';
import { Database } from './supabase';
import { upsertData } from './upsertData';

type TableName = keyof Database['public']['Tables'];

export async function deleteData<Table extends TableName>(
  table: Table,
  id: number[],
  userId: string
) {
  const { error } = await supabase.from(table).delete().in('id', id).eq('user_id', userId);
  if (error) {
    console.error('There was a problem signing up.', error);
    return { success: false, error };
  }
}

export async function deleteAvatar(userId: string) {
  if (!userId) return false;

  const folderPath = `${userId}/`;

  try {
    // List all files in the user's avatar folder
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('avatars')
      .list(folderPath);

    if (listError) throw listError;

    if (Array.isArray(existingFiles) && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${folderPath}${f.name}`);
      const { error: deleteError } = await supabase.storage.from('avatars').remove(filesToDelete);

      if (deleteError) throw deleteError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars/default')
      .getPublicUrl('avatar.png');

    const defaultAvatarUrl = publicUrlData.publicUrl;

    // Remove avatar_url from profile in database
    await upsertData('profiles', [{ user_id: userId, avatar_url: defaultAvatarUrl }], true);

    return true;
  } catch (err) {
    console.error('Failed to delete avatar:', err);
    alert('Failed to delete avatar.');
    return false;
  }
}
