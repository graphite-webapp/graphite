export type DataRow = {
  [key: string]: number | string | undefined;
  date: string;
};

export function aggregateData<T extends DataRow>(
  data: T[],
  valueKey: keyof T,
  aggregateBy?: 'month' | 'day' = 'month'
): T[] {
  const aggregated: Record<string, T> = {};

  data.forEach(session => {
    const sessionDate = new Date(session.date);
    const key =
      aggregateBy == 'day'
        ? sessionDate.toISOString().split('T')[0]
        : `${sessionDate.getMonth() + 1}-${sessionDate.getFullYear()}`;

    const value = Number(session[valueKey] ?? 0);

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

      (aggregated[key][valueKey] as number) = value;
    } else {
      (aggregated[key][valueKey] as number) += value;
    }
  });

  return Object.values(aggregated);
}

export function groupData<T extends DataRow>(data: T[], groupBy: keyof T): T[] {
  const grouped: Record<string, T> = {};

  data.forEach(session => {
    const key = String(session[groupBy]);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(session);
  });

  let ordered = grouped;

  if (groupBy == 'date' || groupBy == 'created_at') {
    ordered = Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((obj: Record<string, T[]>, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});
  }

  return ordered;
}
