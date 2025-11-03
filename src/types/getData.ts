import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database, Tables } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

type TableQueryOptions<Table extends keyof Database['public']['Tables']> = {
  select?: string;
  eq?: Partial<Tables<Table>>;
  neq?: Partial<Tables<Table>>;
  gt?: Partial<Tables<Table>>;
  gte?: Partial<Tables<Table>>;
  lt?: Partial<Tables<Table>>;
  lte?: Partial<Tables<Table>>;
  like?: Partial<Record<keyof Tables<Table>, string>>;
  ilike?: Partial<Record<keyof Tables<Table>, string>>;
  in?: Partial<Record<keyof Tables<Table>, unknown[]>>;
  order?: { column: keyof Tables<Table>; ascending?: boolean }[];
  limit?: number;
  range?: [from: number, to: number];
};

type TableRequest<Table extends keyof Database['public']['Tables']> = {
  table: Table;
  options?: TableQueryOptions<Table>;
};

export async function getData<Table extends keyof Database['public']['Tables']>(
  request: TableRequest<Table>
): Promise<{ data: Tables<Table>[] | null; error: PostgrestError | null }> {
  const { table, options = {} as TableQueryOptions<Table> } = request;

  let query = supabase.from(table).select(options.select ?? '*');

  if (options.eq)
    Object.entries(options.eq).forEach(([k, v]) => v != null && (query = query.eq(k, v)));
  if (options.neq)
    Object.entries(options.neq).forEach(([k, v]) => v != null && (query = query.neq(k, v)));
  if (options.gt)
    Object.entries(options.gt).forEach(([k, v]) => v != null && (query = query.gt(k, v)));
  if (options.gte)
    Object.entries(options.gte).forEach(([k, v]) => v != null && (query = query.gte(k, v)));
  if (options.lt)
    Object.entries(options.lt).forEach(([k, v]) => v != null && (query = query.lt(k, v)));
  if (options.lte)
    Object.entries(options.lte).forEach(([k, v]) => v != null && (query = query.lte(k, v)));

  if (options.like)
    Object.entries(options.like).forEach(
      ([k, v]) => typeof v === 'string' && v.length > 0 && (query = query.like(k, v))
    );
  if (options.ilike)
    Object.entries(options.ilike).forEach(
      ([k, v]) => typeof v === 'string' && v.length > 0 && (query = query.ilike(k, v))
    );
  if (options.in)
    Object.entries(options.in).forEach(
      ([k, v]) => Array.isArray(v) && v.length > 0 && (query = query.in(k, v))
    );

  if (options.order)
    options.order.forEach(
      ({ column, ascending = true }) => (query = query.order(column as string, { ascending }))
    );
  if (options.range) query = query.range(options.range[0], options.range[1]);
  if (options.limit != null) query = query.limit(options.limit);

  const { data, error } = await query;
  return { data: (data as Tables<Table>[] | null) ?? null, error };
}

type useFetchDataOptions<
  TTables extends readonly TableRequest<keyof Database['public']['Tables']>[],
> = {
  userId?: string | null;
  tables: TTables;
  initialData?: {
    [K in TTables[number]['table']]?: Tables<K>[];
  };
  transform?: (data: {
    [K in TTables[number]['table']]: Tables<K>[];
  }) => {
    [K in TTables[number]['table']]: Tables<K>[];
  };
  refetchDeps?: unknown[];
  src?: string;
};

export function useFetchData<
  TTables extends readonly TableRequest<keyof Database['public']['Tables']>[],
>({
  userId,
  tables,
  initialData = {},
  transform,
  refetchDeps = [],
  src = 'page',
}: useFetchDataOptions<TTables>) {
  type TableMap = { [K in TTables[number]['table']]: Tables<K>[] };

  const [data, setData] = useState<Partial<TableMap>>(initialData);
  const [loading, setLoading] = useState<boolean>(
    userId == null || Object.keys(initialData).length === 0
  );
  const [fetched, setFetched] = useState<boolean>(false);
  const refetchKey = JSON.stringify(refetchDeps);

  useEffect(() => {
    if (userId == null || fetched) return;

    const run = async () => {
      setLoading(true);
      const fetchedData = {} as Partial<TableMap>;

      for (const t of tables) {
        const eqWithUserId = t.options?.eq
          ? { ...t.options.eq, user_id: userId }
          : { user_id: userId };

        const { data: tableData, error } = await getData({
          table: t.table,
          options: { ...t.options, eq: eqWithUserId },
        });

        if (error) console.error(`Error fetching table ${t.table}:`, error);

        const key = t.table as TTables[number]['table'];
        fetchedData[key] = (Array.isArray(tableData) ? tableData : []) as Tables<typeof key>[];
      }

      let merged = {
        ...(initialData as TableMap),
        ...(fetchedData as TableMap),
      };

      if (transform) merged = transform(merged);

      setData(merged);
      setFetched(true);
      setLoading(false);
    };

    void run();
  }, [userId, src, fetched, tables, initialData, transform, refetchKey]);

  return { data, loading, refetch: () => setFetched(false) };
}

export function makeTableRequest<Table extends keyof Database['public']['Tables']>(
  req: TableRequest<Table>
): TableRequest<Table> {
  return req;
}
