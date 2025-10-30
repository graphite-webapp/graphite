export type DataRow = {
  [key: string]: number | string | undefined;
  date: string;
};

type AggregationConfig = {
  [key: string]: 'sum' | 'min' | 'max' | 'avg';
};

export function aggregateData<T extends DataRow>(
  data: T[],
  aggregateBy: 'month' | 'day' = 'month',
  config?: AggregationConfig<T>
): T[] {
  const aggregated: Record<string, T> = {};
  const counts: Record<string, Record<string, number>> = {};

  data.forEach(session => {
    const sessionDate = new Date(session.date);
    const key =
      aggregateBy == 'day'
        ? sessionDate.toISOString().split('T')[0]
        : `${sessionDate.getMonth() + 1}-${sessionDate.getFullYear()}`;

    if (aggregated[key] === undefined) {
      aggregated[key] = { ...session };
      aggregated[key].date =
        aggregateBy == 'day'
          ? new Date(
              sessionDate.getFullYear(),
              sessionDate.getMonth(),
              sessionDate.getDate()
            ).toISOString()
          : new Date(sessionDate.getFullYear(), sessionDate.getMonth(), 1).toISOString();
      counts[key] = {};
    } else {
      const existing = aggregated[key];

      for (const valueKey in session) {
        const rule = config?.[valueKey as keyof T];
        const value = session[valueKey];

        if (typeof value !== 'number') continue;

        switch (rule) {
          case 'sum':
            existing[valueKey] = ((existing[valueKey] as number) ?? 0) + value;
            break;
          case 'min':
            existing[valueKey] =
              existing[valueKey] === undefined
                ? value
                : Math.min(existing[valueKey] as number, value);
            break;
          case 'max':
            existing[valueKey] =
              existing[valueKey] === undefined
                ? value
                : Math.max(existing[valueKey] as number, value);
            break;
          case 'avg':
            counts[key][valueKey] = (counts[key][valueKey] ?? 0) + 1;
            const count = counts[key][valueKey];
            const prev = (existing[valueKey] as number) ?? 0;
            existing[valueKey] = prev + (value - prev) / count;
            break;
          default:
            // no rule — ignore
            existing[valueKey] = ((existing[valueKey] as number) ?? 0) + value;
            break;
        }
      }
    }
  });

  return Object.values(aggregated);
}

export function groupData<T extends DataRow>(data: T[], groupBy: keyof T): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  data.forEach(session => {
    const key = String(session[groupBy]);
    if (grouped[key] == undefined) grouped[key] = [];
    grouped[key].push(session);
  });

  if (groupBy == 'date' || groupBy == 'created_at') {
    const ordered: Record<string, T[]> = {};
    Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(key => {
        ordered[key] = grouped[key];
      });
    return ordered;
  }

  return grouped;
}
