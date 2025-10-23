import { upsertData } from '@/types/upsertData';
import { deleteData } from '@/types/deleteData';
import { TableName } from './db';

type submitValue = {
  key: string;
  id: string;
  type: 'number' | 'array' | 'text';
};

type handleSubmitParams = {
  userId: string;
  table: TableName;
  submitType: 'insert' | 'update' | 'delete';
  recordId?: number | null;
  form?: HTMLFormElement | HTMLElement | null;
  values?: submitValue[];
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

export const handleSubmit = async ({
  userId,
  submitType,
  table,
  recordId = null,
  form = null,
  values = [],
}: handleSubmitParams) => {
  if (submitType == 'delete') {
    if (recordId == null) return;
    await deleteData(table, recordId, userId);
    location.reload();
    return;
  }

  if (!form) return;

  const formData: Record<string, string | number | string[]> & { user_id: string } = {
    user_id: userId,
  };
  if (recordId !== null) {
    formData.id = recordId;
  }

  let calcSessionDuration = false;
  let calcWordsWritten = false;
  let calcWpm = false;

  values.forEach((value: submitValue) => {
    if (value.key == 'session_duration') {
      calcSessionDuration = true;
      return;
    }
    if (value.key == 'words_written') {
      calcWordsWritten = true;
      return;
    }
    if (value.key == 'wpm') {
      calcWpm = true;
      return;
    }

    if (value.type == 'number') {
      formData[value.key] = Number((form.querySelector(value.id) as HTMLInputElement).value);
      return;
    }

    if (value.type == 'array') {
      formData[value.key] = (form.querySelector(value.id) as HTMLInputElement).value.split(', ');
      return;
    }

    formData[value.key] = (form.querySelector(value.id) as HTMLInputElement).value;
  });

  if (
    calcWordsWritten &&
    (formData.start_count !== null || formData.start_count !== undefined) &&
    (formData.end_count !== null || formData.end_count !== undefined)
  ) {
    formData['words_written'] = Number(formData.end_count) - Number(formData.start_count);
  }

  if (
    calcSessionDuration &&
    (formData.start_time !== null || formData.start_time !== undefined) &&
    (formData.end_time !== null || formData.end_time !== undefined)
  ) {
    const { string: sessionDurationString, mins: sessionDurationMins } = calculateTimeDiff(
      formData.start_time as string,
      formData.end_time as string
    );

    formData['session_duration'] = sessionDurationString;

    if (
      calcWpm &&
      (formData.words_written !== null || formData.words_written !== undefined) &&
      sessionDurationMins
    ) {
      formData['wpm'] = Math.round(Number(formData.words_written) / sessionDurationMins);
    }
  }

  upsertData(table, [formData]);
  if (form instanceof HTMLFormElement) form.reset();
  location.reload();
};
