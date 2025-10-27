import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { type TableName, BaseRow } from './db';

export type FetchDataResult = {
  sessions?: BaseRow[];
  chapters?: BaseRow[];
  goals?: BaseRow[];
  profiles?: BaseRow[];
  settings?: BaseRow[];
};

export async function getData(
  table: TableName,
  userId: string | null = null,
  startPeriod: Date | null = null,
  endPeriod: Date | null = null
) {
  const { data, error } = await supabase
    .from(table)
    .select()
    .eq('user_id', userId)
    .order(table !== 'goals' && table !== 'profiles' ? 'date' : 'created_at', { ascending: true });

  if (error || data == null) {
    console.error('There was a problem signing up.', error);
    return { success: false, error };
  }

  let filteredData = data;
  if (startPeriod !== null && endPeriod !== null) {
    filteredData = data.filter(row => {
      const baseRow = row as BaseRow;

      const dateStr =
        typeof baseRow.date == 'string'
          ? baseRow.date
          : typeof baseRow.created_at == 'string'
            ? baseRow.created_at
            : null;

      if (dateStr === null || dateStr === '') return false;

      const rowDate = new Date(dateStr);
      return rowDate >= startPeriod && rowDate <= endPeriod;
    });
  }

  return { success: true, data: filteredData };
}

export async function collectData(
  userId: string,
  tables: TableName[] = [],
  start: Date | null = null,
  end: Date | null = null
): Promise<Partial<FetchDataResult>> {
  const result: Partial<FetchDataResult> = {};

  if (tables.includes('sessions')) {
    const sessionData = await getData('sessions', userId, start ?? null, end ?? null);
    if (sessionData.success) result.sessions = sessionData.data;
  }

  if (tables.includes('chapters')) {
    const chapterData = await getData('chapters', userId, start ?? null, end ?? null);
    if (chapterData.success) result.chapters = chapterData.data;
  }

  if (tables.includes('goals')) {
    const goalData = await getData('goals', userId);
    if (goalData.success) result.goals = goalData.data;
  }

  if (tables.includes('profiles')) {
    const profileData = await getData('profiles', userId);
    if (profileData.success) result.profiles = profileData.data;
  }

  return result;
}

export function useHandleData(
  src: 'page' | 'component',
  userId: string | undefined,
  tables: TableName[],
  start: Date | null = null,
  end: Date | null = null,
  initialData: Partial<Record<TableName, BaseRow[]>> = {}
) {
  const [data, setData] = useState<Partial<Record<TableName, BaseRow[]>>>(initialData);
  const [loading, setLoading] = useState(
    userId === null ||
      userId === undefined ||
      userId === '' ||
      Object.keys(initialData).length === 0
  );
  const [fetched, setFetched] = useState(false);

  const filterByDateRange = (
    rows: BaseRow[],
    start: Date | null = null,
    end: Date | null = null
  ) => {
    if (!start || !end) return rows;

    return rows.filter(row => {
      const dateField = (row.date ?? row.created_at) as string | undefined;
      if (dateField === null || dateField === undefined || dateField === '') return false;
      const rowDate = new Date(dateField);
      return rowDate >= start && rowDate <= end;
    });
  };

  useEffect(() => {
    if (userId === null || userId === undefined || userId === '' || fetched) return;

    const missingTables = tables.filter(table => !initialData[table]);

    const run = async () => {
      setLoading(true);
      if (missingTables.length === 0 && src == 'component') {
        const filtered: Partial<Record<TableName, BaseRow[]>> = {};

        if (initialData.sessions)
          filtered.sessions = filterByDateRange(initialData.sessions, start ?? null, end ?? null);

        if (initialData.chapters)
          filtered.chapters = filterByDateRange(initialData.chapters, start ?? null, end ?? null);

        if (initialData.goals) filtered.goals = initialData.goals;

        setData(filtered);
      } else {
        const fetched = await collectData(userId, missingTables, start ?? null, end ?? null);
        setData(prev => ({ ...prev, ...fetched }));
      }

      setFetched(true);
      setLoading(false);
    };

    run();
  }, [userId, start, end, tables, initialData, fetched, src]);

  return { data, loading };
}
