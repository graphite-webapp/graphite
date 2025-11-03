import Papa, { ParseResult } from 'papaparse';
import { upsertData } from './upsertData';
import { TableName } from './svg';
import { data } from './upsertData';
import { parseDate } from './dates';

interface CsvRow {
  [key: string]: string | number | null | number[];
}

export const submitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
  const file = e.target.files?.[0];
  if (!file) return;

  Papa.parse<CsvRow>(file as File, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: async (results: ParseResult<CsvRow>) => {
      if (results.errors.length > 0) {
        console.error(results.errors);
        return;
      }

      const table: TableName = await identifyTable(results.meta.fields ?? []);
      const data = (await equalizeFieldsToCols(userId, results.data)) as data[];
      await upsertData(table, data);
    },
  });
};

const identifyTable = async (fields: string[]) => {
  const lowerFields = fields.map(h => h.toLowerCase().trim());
  const identifyingCols = ['date', 'count', 'time', 'chapter', 'year', 'month'];

  const matchedCols = identifyingCols.filter(col => lowerFields.some(field => field.includes(col)));

  if (matchedCols.includes('count')) return 'sessions';
  if (matchedCols.includes('year')) return 'goals';
  return 'chapters';
};

const equalizeFieldsToCols = async (userId: string, data: CsvRow[]) => {
  return data.map(row => {
    const keys = Object.keys(row);
    const cleanedKeys = keys.map(key => key.toLowerCase().replace(/ /g, '_'));

    const equalizedRow: CsvRow = {};
    keys.forEach((key, i) => {
      let cleanedKey = cleanedKeys[i];

      if (cleanedKey == 'starting_count') cleanedKey = 'start_count';
      if (cleanedKey == 'chapter(s)_worked_on') cleanedKey = 'chapter';

      equalizedRow[cleanedKey] = row[key];
    });

    const cleanedRow = cleanRowData(Object.keys(equalizedRow), equalizedRow);
    cleanedRow['user_id'] = userId;

    return cleanedRow;
  });
};

const cleanRowData = (keys: string[], row: CsvRow) => {
  const numberCols = ['start_count', 'end_count', 'words_written', 'wpm', 'chapter_completed'];
  const arrayCols = ['chapter'];
  const dateCols = ['date'];

  numberCols.forEach(col => {
    if (keys.includes(col)) {
      if (typeof row[col] == 'string') {
        row[col] = Number(row[col].replace(',', '').replace('.', ''));
      } else {
        row[col] = row[col];
      }
    }
  });

  arrayCols.forEach(col => {
    if (keys.includes(col)) {
      const array = row[col]?.toString().split(', ');

      const cleanedArray: number[] = [];
      array?.forEach(item => {
        cleanedArray.push(Number(item));
      });

      row[col] = cleanedArray;
    }
  });

  dateCols.forEach(col => {
    if (keys.includes(col) && row[col] != null) {
      row[col] = parseDate(row[col].toString()).toISOString();
    }
  });

  return row;
};
