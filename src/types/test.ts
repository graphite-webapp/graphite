import { supabase } from '@/lib/supabaseClient';
import { Database, Tables } from './supabase';
import { useState, useEffect } from 'react';

type QueryOptions<Table extends keyof Database['public']['Tables']> = {
  select?: string;
  eq?: Partial<Tables<Table>>;
  neq?: Partial<Tables<Table>>;
  gt?: Partial<Record<keyof Tables<Table>, unknown>>;
  gte?: Partial<Record<keyof Tables<Table>, unknown>>;
  lt?: Partial<Record<keyof Tables<Table>, unknown>>;
  lte?: Partial<Record<keyof Tables<Table>, unknown>>;
  like?: Partial<Record<keyof Tables<Table>, string>>;
  ilike?: Partial<Record<keyof Tables<Table>, string>>;
  in?: Partial<Record<keyof Tables<Table>, unknown[]>>;
  order?: { column: keyof Tables<Table>; ascending?: boolean }[];
  limit?: number;
  range?: [from: number, to: number];
  single?: boolean;
};

/**
 * Generic Supabase fetch function
 */
export async function getData<Table extends keyof Database['public']['Tables']>(
  table: Table,
  options: QueryOptions<Table> = {}
) {
  let query = supabase.from(table as string).select(options.select ?? '*');

  if (options.eq) {
    Object.entries(options.eq).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.eq(k, v);
    });
  }
  if (options.neq)
    Object.entries(options.neq).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.neq(k, v);
    });
  if (options.gt)
    Object.entries(options.gt).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.gt(k, v);
    });
  if (options.gte)
    Object.entries(options.gte).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.gte(k, v);
    });
  if (options.lt)
    Object.entries(options.lt).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.lt(k, v);
    });
  if (options.lte)
    Object.entries(options.lte).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query = query.lte(k, v);
    });
  if (options.like)
    Object.entries(options.like).forEach(([k, v]) => {
      if (typeof v === 'string' && v.length > 0) query = query.like(k, v);
    });
  if (options.ilike)
    Object.entries(options.ilike).forEach(([k, v]) => {
      if (typeof v === 'string' && v.length > 0) query = query.ilike(k, v);
    });
  if (options.in)
    Object.entries(options.in).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) query = query.in(k, v);
    });
  if (options.order)
    options.order.forEach(({ column, ascending = true }) => {
      query = query.order(column as string, { ascending });
    });
  if (options.range) query = query.range(options.range[0], options.range[1]);
  if (options.limit !== undefined) query = query.limit(options.limit);

  return options.single === true ? await query.single() : await query;
}

type useFetchDataOptions<TRow extends Record<string, unknown>> = {
  userId: string | null | undefined;
  tables: (keyof Database['public']['Tables'])[];
  initialData?: Partial<Record<string, TRow[]>>;
  transform?: (data: Record<string, TRow[]>) => Record<string, TRow[]>;
  refetchDeps?: unknown[];
  src?: string;
};

export function useFetchData<TRow extends Record<string, unknown>>({
  userId,
  tables,
  initialData = {},
  transform,
  refetchDeps = [],
  src = 'page',
}: useFetchDataOptions<TRow>) {
  const [data, setData] = useState<Record<string, TRow[]>>(initialData as Record<string, TRow[]>);
  const [loading, setLoading] = useState<boolean>(
    userId === null ||
      userId === undefined ||
      userId === '' ||
      Object.keys(initialData).length === 0
  );
  const [fetched, setFetched] = useState<boolean>(false);

  const refetchKey = JSON.stringify(refetchDeps);

  useEffect(() => {
    if (userId === null || userId === undefined || userId === '' || fetched) return;

    const run = async () => {
      setLoading(true);

      const fetchedData: Record<string, TRow[]> = {};

      for (const table of tables) {
        try {
          const { data: tableData, error } = await getData(table, { eq: { user_id: userId } });

          if (error) console.error(`Error fetching table ${String(table)}:`, error);

          // Safe casting
          fetchedData[String(table)] = Array.isArray(tableData)
            ? (tableData as unknown as TRow[])
            : [];
        } catch (err) {
          console.error(`Unexpected error fetching table ${String(table)}:`, err);
          fetchedData[String(table)] = [];
        }
      }

      let merged: Record<string, TRow[]> = Object.fromEntries(
        Object.entries({ ...initialData, ...fetchedData }).map(([k, v]) => [String(k), v ?? []])
      );

      if (transform !== undefined && transform !== null) merged = transform(merged);

      setData(merged);
      setFetched(true);
      setLoading(false);
    };

    void run();
  }, [userId, src, fetched, tables, initialData, transform, refetchKey]);

  return { data, loading, refetch: () => setFetched(false) };
}
