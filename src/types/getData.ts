import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

/* ---------- Types ---------- */

export type FetchResult<T> = {
  success: boolean;
  data?: T[];
  error?: any;
};

export type TableQueryConfig<T> = QueryOptions<T> & {
  table: string;
};

export type QueryOptions<T> = {
  filters?: (query: any) => any;
  orderBy?: keyof T | string;
  ascending?: boolean;
  startPeriod?: Date | null;
  endPeriod?: Date | null;
  limit?: number | null;
};

export type CollectResult<RecordType> = Partial<Record<string, RecordType[]>>;

export interface UseHandleDataOptions<T> {
  userId?: string | null;
  tables: TableQueryConfig<T>[]; // each table has its own query options
  initialData?: Partial<Record<string, T[]>>;
  transform?: (data: Record<string, T[]>) => Record<string, T[]>; // whole-data transform
  refetchDeps?: any[];
  src?: 'page' | 'component';
}

/* ---------- Core Fetch Functions ---------- */

export async function getData<T extends Record<string, any>>(
  table: string,
  userId?: string | null,
  options: QueryOptions<T> = {}
): Promise<FetchResult<T>> {
  try {
    let query = supabase.from(table).select('*');

    if (userId) query = query.eq('user_id', userId);

    if (options.filters) query = options.filters(query);

    if (options.orderBy)
      query = query.order(options.orderBy as string, { ascending: options.ascending ?? true });

    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;

    if (error || !data) throw error;

    let filteredData = data as T[];

    if (options.startPeriod && options.endPeriod) {
      filteredData = filteredData.filter(row => {
        const dateStr = row.date ?? row.created_at;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= options.startPeriod! && date <= options.endPeriod!;
      });
    }

    return { success: true, data: filteredData };
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return { success: false, error };
  }
}

export async function collectData<T extends Record<string, any>>(
  userId: string,
  tableConfigs: TableQueryConfig<T>[]
): Promise<Record<string, T[]>> {
  const results: Record<string, T[]> = {};

  await Promise.all(
    tableConfigs.map(async cfg => {
      const { table, ...options } = cfg;
      const res = await getData<T>(table, userId, options);
      if (res.success && res.data) results[table] = res.data;
    })
  );

  return results;
}

/* ---------- React Hook ---------- */

export function useHandleData<T extends Record<string, any>>({
  userId,
  tables,
  initialData = {},
  transform,
  refetchDeps = [],
  src = 'page',
}: UseHandleDataOptions<T>) {
  const [data, setData] = useState<Record<string, T[]>>(initialData);
  const [loading, setLoading] = useState(!userId || Object.keys(initialData).length === 0);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!userId || fetched) return;

    const run = async () => {
      setLoading(true);

      const fetchedData = await collectData<T>(userId, tables);
      let merged = { ...initialData, ...fetchedData };

      if (transform) merged = transform(merged);

      setData(merged);
      setFetched(true);
      setLoading(false);
    };

    run();
  }, [userId, src, ...refetchDeps]);

  return { data, loading, refetch: () => setFetched(false) };
}
