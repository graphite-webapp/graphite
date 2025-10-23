export const parseDate = (date: string) => {
  const dateParts = date.replace(/\//g, '-').split('-');
  let year: number | undefined;
  let month: boolean | number = false;
  let day: number | undefined;

  dateParts.forEach(part => {
    const partNum = Number(part);
    if (part.length > 2) {
      year = partNum;
    }

    if (part.length <= 2 && partNum > 12) {
      day = partNum;
    }

    if (part.length <= 2 && partNum < 12) {
      month = partNum;
    }
  });

  if (year == undefined) {
    year = new Date().getFullYear();
  }

  if (!month || day == undefined) {
    day = Number(dateParts[0]);
    month = Number(dateParts[1]);
  }

  return new Date(year, month - 1, day);
};

export const sumDurations = (durations: string[]): string => {
  let totalMinutes = 0;

  durations.forEach(duration => {
    const [hoursStr, minutesStr] = duration.split(':');
    const hours = Number(hoursStr) || 0;
    const minutes = Number(minutesStr) || 0;
    totalMinutes += hours * 60 + minutes;
  });

  const resultHours = Math.floor(totalMinutes / 60);
  const resultMinutes = totalMinutes % 60;

  return `${resultHours !== 0 ? `${String(resultHours).padStart(2, '0')}h` : ''}${String(resultMinutes).padStart(2, '0')}m`;
};
