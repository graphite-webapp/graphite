import { upsertData } from '@/types/upsertData';
import { deleteData } from '@/types/deleteData';
import { Database, Tables } from './supabase';

type TableName = keyof Database['public']['Tables'];

export type submitValue<Table extends TableName> = {
  key: keyof Tables<Table>;
  id: string;
  type: 'number' | 'array' | 'text' | 'radio';
};

type handleSubmitParams<Table extends TableName> = {
  userId: string;
  table: Table;
  submitType: 'insert' | 'update' | 'delete';
  recordId?: null | number[];
  form?: HTMLFormElement | HTMLElement | null;
  values?: submitValue<Table>[];
};

const calculateTimeDiff = (startTime: string, endTime: string) => {
  const startTimeSplit = startTime.split(':');
  const endTimeSplit = endTime.split(':');

  const startTimeDate = new Date(0, 0, 0, Number(startTimeSplit[0]), Number(startTimeSplit[1]), 0);
  const endTimeDate = new Date(0, 0, 0, Number(endTimeSplit[0]), Number(endTimeSplit[1]), 0);

  let timeDiff = endTimeDate.getTime() - startTimeDate.getTime();
  const hours = Math.floor(timeDiff / 1000 / 60 / 60);
  const mins = Math.floor(timeDiff / 1000 / 60);
  timeDiff -= hours * 1000 * 60 * 60;

  return {
    string: `${hours}:${Math.floor(timeDiff / 1000 / 60)}`,
    hours: hours,
    mins: mins,
  };
};

export const handleSubmit = async <Table extends TableName>({
  userId,
  submitType,
  table,
  recordId = null,
  form = null,
  values = [],
}: handleSubmitParams<Table>): Promise<void> => {
  if (submitType == 'delete') {
    if (recordId == null) return;
    await deleteData(table, recordId, userId);
    location.reload();
    return;
  }

  if (!form) return;

  const formData: Partial<Tables<Table>> = {};

  if ('user_id' in ({} as Tables<Table>)) {
    (formData as Partial<{ user_id: string }> & Partial<Tables<Table>>).user_id = userId;
  }

  if (recordId !== null && recordId.length > 0 && 'id' in ({} as Tables<Table>)) {
    (formData as Partial<{ id: number }> & Partial<Tables<Table>>).id = recordId[0];
  }

  let calcSessionDuration = false;
  let calcWordsWritten = false;
  let calcWpm = false;

  values.forEach(value => {
    const key = value.key;

    if (key == 'session_duration') {
      calcSessionDuration = true;
      return;
    }
    if (key == 'words_written') {
      calcWordsWritten = true;
      return;
    }
    if (key == 'wpm') {
      calcWpm = true;
      return;
    }

    if (value.type === 'number') {
      setFormData(
        formData,
        key,
        Number(
          (form.querySelector(value.id) as HTMLInputElement).value
        ) as Tables<Table>[typeof key]
      );
      return;
    }

    if (value.type === 'array') {
      setFormData(
        formData,
        key,
        (form.querySelector(value.id) as HTMLInputElement).value.split(
          ', '
        ) as Tables<Table>[typeof key]
      );
      return;
    }

    if (value.type === 'radio') {
      setFormData(
        formData,
        key,
        (form.querySelector(value.id) as HTMLInputElement).id.replace(
          '-',
          ' '
        ) as Tables<Table>[typeof key]
      );
      return;
    }

    setFormData(
      formData,
      key,
      (form.querySelector(value.id) as HTMLInputElement).value as Tables<Table>[typeof key]
    );
  });

  if (table === 'sessions') {
    const sessionData = formData as Partial<Tables<'sessions'>>;

    if (calcWordsWritten && sessionData.start_count != null && sessionData.end_count != null) {
      sessionData.words_written = sessionData.end_count - sessionData.start_count;
    }

    if (calcSessionDuration && sessionData.start_time != null && sessionData.end_time != null) {
      const { string: sessionDurationString, mins: sessionDurationMins } = calculateTimeDiff(
        sessionData.start_time,
        sessionData.end_time
      );

      sessionData.session_duration = sessionDurationString;

      if (calcWpm && sessionData.words_written != null && sessionDurationMins) {
        sessionData.wpm = Math.round(sessionData.words_written / sessionDurationMins);
      }
    }
  }

  await upsertData(table, [formData], table == 'settings' ? true : false);
  if (form instanceof HTMLFormElement) form.reset();
  location.reload();
};

function setFormData<Table extends TableName, Key extends keyof Tables<Table>>(
  formData: Partial<Tables<Table>>,
  key: Key,
  value: Tables<Table>[Key]
) {
  formData[key] = value;
}
