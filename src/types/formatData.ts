import { Database, Tables } from './supabase';

export type AggregationRule = 'sum' | 'min' | 'max' | 'avg';

type AggregationConfig<T> = Partial<Record<keyof T, AggregationRule>>;

export function aggregateData<TableName extends keyof Database['public']['Tables']>(
  data: Tables<TableName>[],
  aggregateBy: 'month' | 'day' = 'month',
  config?: AggregationConfig<Tables<TableName>>
): Tables<TableName>[] {
  const aggregated: Record<string, Tables<TableName>> = {};
  const counts: Record<string, Record<string, number>> = {};

  data.forEach(row => {
    let sessionDate;
    if ('date' in row) {
      sessionDate = new Date(row.date);
    } else {
      sessionDate = new Date(row.created_at);
    }

    const key =
      aggregateBy === 'day'
        ? sessionDate.toISOString().split('T')[0]
        : `${sessionDate.getMonth() + 1}-${sessionDate.getFullYear()}`;

    if (aggregated[key] == undefined) {
      aggregated[key] = { ...row } as Tables<TableName>;
      if ('date' in row) {
        (aggregated[key] as typeof row).date =
          aggregateBy === 'day'
            ? new Date(
                sessionDate.getFullYear(),
                sessionDate.getMonth(),
                sessionDate.getDate()
              ).toISOString()
            : new Date(sessionDate.getFullYear(), sessionDate.getMonth(), 1).toISOString();
      } else {
        (aggregated[key] as typeof row).created_at =
          aggregateBy === 'day'
            ? new Date(
                sessionDate.getFullYear(),
                sessionDate.getMonth(),
                sessionDate.getDate()
              ).toISOString()
            : new Date(sessionDate.getFullYear(), sessionDate.getMonth(), 1).toISOString();
      }

      counts[key] = {};
      return;
    }

    const existing = aggregated[key];

    (Object.keys(row) as Array<keyof Tables<TableName>>).forEach(k => {
      if (k === 'date') return;

      const value = row[k];
      if (typeof value !== 'number') return;

      const rule = config?.[k];

      switch (rule) {
        case 'sum':
          existing[k] = (((existing[k] as number) || 0) + value) as Tables<TableName>[typeof k];
          break;
        case 'min':
          existing[k] =
            existing[k] === undefined
              ? (value as Tables<TableName>[typeof k])
              : (Math.min(existing[k] as number, value) as Tables<TableName>[typeof k]);
          break;
        case 'max':
          existing[k] =
            existing[k] === undefined
              ? (value as Tables<TableName>[typeof k])
              : (Math.max(existing[k] as number, value) as Tables<TableName>[typeof k]);
          break;
        case 'avg':
          counts[key][k as string] = (counts[key][k as string] ?? 0) + 1;
          const count = counts[key][k as string];
          const prev = (existing[k] as number) || 0;
          existing[k] = (prev + (value - prev) / count) as Tables<TableName>[typeof k];
          break;
        default:
          existing[k] = (((existing[k] as number) || 0) + value) as Tables<TableName>[typeof k];
          break;
      }
    });
  });

  return Object.values(aggregated);
}

export function groupData<Table extends keyof Database['public']['Tables']>(
  data: Tables<Table>[],
  groupBy: keyof Tables<Table>
): Record<string, Tables<Table>[]> {
  const grouped: Record<string, Tables<Table>[]> = {};

  data.forEach(row => {
    const key = String(row[groupBy]);
    if (grouped[key] == undefined) grouped[key] = [];
    grouped[key].push(row);
  });

  if (groupBy === 'date' || groupBy === 'created_at') {
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce<Record<string, Tables<Table>[]>>((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }

  return grouped;
}
