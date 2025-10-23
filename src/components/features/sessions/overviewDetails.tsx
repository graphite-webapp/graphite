import styles from '@/styles/modules/overview.module.scss';
import { useState } from 'react';

export default function OverviewDetails({ collapsed, dataTable, headers, sessions }) {
  const [editingRowId, setEditingRowId] = useState<number | boolean>(false);

  const insertRow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    let editValues = [
      { key: 'date', id: '#date', type: 'text' },
      { key: 'start_time', id: '#start-time', type: 'text' },
      { key: 'end_time', id: '#end-time', type: 'text' },
      { key: 'start_count', id: '#start-count', type: 'text' },
      { key: 'end_count', id: '#end-count', type: 'text' },
      { key: 'words_written', id: '', type: 'number' },
      { key: 'session_duration', id: '', type: 'text' },
      { key: 'wpm', id: '', type: 'number' },
      { key: 'chapter', id: '#chapter', type: 'array' },
    ];

    if (dataTable == 'chapters') {
      editValues = [
        { key: 'date', id: `#date`, type: 'text' },
        { key: 'chapter_completed', id: `#chapter-completed`, type: 'number' },
      ];
    }

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'insert',
      table: dataTable,
      recordId: null,
      form,
      values: editValues,
    });
  };

  const editRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget.closest('tr') as HTMLTableRowElement;
    const sessionId = row.dataset.id!;
    setEditingRowId(Number(sessionId));
  };

  const cancelEdit = () => {
    setEditingRowId(false);
  };

  const submitEdit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget.closest('tr') as HTMLTableRowElement;
    const sessionId = row.dataset.id!;

    let editValues = [
      { key: 'date', id: `#date-${sessionId}`, type: 'text' },
      { key: 'start_time', id: `#start-time-${sessionId}`, type: 'text' },
      { key: 'end_time', id: `#end-time-${sessionId}`, type: 'text' },
      { key: 'start_count', id: `#start-count-${sessionId}`, type: 'text' },
      { key: 'end_count', id: `#end-count-${sessionId}`, type: 'text' },
      { key: 'words_written', id: sessionId, type: 'number' },
      { key: 'session_duration', id: sessionId, type: 'text' },
      { key: 'wpm', id: sessionId, type: 'number' },
      { key: 'chapter', id: `#chapter-${sessionId}`, type: 'array' },
    ];

    if (dataTable == 'chapters') {
      editValues = [
        { key: 'date', id: `#date-${sessionId}`, type: 'text' },
        { key: 'chapter_completed', id: `#chapter-completed-${sessionId}`, type: 'number' },
      ];
    }

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'update',
      table: dataTable,
      recordId: Number(sessionId),
      form: row,
      values: editValues,
    });

    setEditingRowId(false);
  };

  const deleteRow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget.closest('tr') as HTMLTableRowElement;
    const sessionId = row.dataset.id!;

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'delete',
      table: dataTable,
      recordId: Number(sessionId),
    });
  };

  return (
    <form
      className={`${collapsed ? 'collapsed' : 'show d-flex'} ${styles.form}`}
      onSubmit={insertRow}
    >
      <table cellSpacing="0">
        <thead>
          <tr>
            {headers.map(header => {
              const withSpaces = (header as string).replace(/(_)/g, ' ');

              let formattedHeader =
                withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();

              if (header == 'wpm') {
                formattedHeader = 'WPM';
              }
              return <td key={header}>{formattedHeader}</td>;
            })}
            <td>Options</td>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            const isEditing = editingRowId === session.id;

            return (
              <tr key={session.id} data-id={session.id}>
                {headers.map(header => {
                  const value = session[header as keyof typeof session];
                  const headerTitle = (header as string).toLowerCase();
                  const withSpaces = (header as string).replace(/(_)/g, ' ');
                  let formattedHeader =
                    withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();

                  if (header == 'wpm') {
                    formattedHeader = 'WPM';
                  }
                  let displayValue = value;

                  if (headerTitle.includes('date')) {
                    displayValue = new Date(value as string).toLocaleDateString();
                  }

                  if (headerTitle.includes('session_duration')) {
                    const [hours, minutes] = (value as string).split(':');
                    const dateObj = new Date();
                    dateObj.setHours(Number(hours), Number(minutes));
                    displayValue = dateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  }

                  if (headerTitle.includes('time')) {
                    const [startHours, startMinutes] = (session.start_time as string).split(':');
                    const startDateObj = new Date();
                    startDateObj.setHours(Number(startHours), Number(startMinutes));
                    const startTime = startDateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const [endHours, endMinutes] = (session.end_time as string).split(':');
                    const endDateObj = new Date();
                    endDateObj.setHours(Number(endHours), Number(endMinutes));
                    const endTime = endDateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    displayValue = `${startTime} - ${endTime}`;
                  }

                  if (headerTitle.includes('count')) {
                    displayValue = `${session.start_count.toLocaleString()} - ${session.end_count.toLocaleString()}`;
                  }

                  if (headerTitle == 'chapter') {
                    displayValue = (value as string[]).join(', ');
                  }

                  if (
                    isEditing &&
                    [
                      'date',
                      'start_time',
                      'end_time',
                      'start_count',
                      'end_count',
                      'chapter',
                      'chapter_completed',
                    ].includes(header)
                  ) {
                    let type = 'text';
                    if (header.includes('date')) {
                      type = 'date';
                      displayValue = new Date(value as string).toISOString().split('T')[0];
                    }

                    if (header.includes('time')) {
                      type = 'time';
                    }

                    if (header.includes('count') || header == 'chapter_completed') {
                      type = 'number';
                    }

                    return (
                      <td key={header} className={styles.edit_cell} data-label={formattedHeader}>
                        <input
                          id={`${header.replace(/(_)/g, '-')}-${session.id}`}
                          type={type}
                          defaultValue={displayValue as string}
                        ></input>
                      </td>
                    );
                  }

                  return (
                    <td key={header} data-label={formattedHeader}>
                      {(displayValue as string).toLocaleString()}
                    </td>
                  );
                })}
                <td className="d-flex gap-05">
                  <button
                    onClick={isEditing ? submitEdit : editRow}
                    type="button"
                    className="has-icon btn btn-primary d-flex flex-center"
                  >
                    {isEditing ? (
                      <span className="material-icon inline-icon">check_circle</span>
                    ) : (
                      <span className="material-icon inline-icon">edit</span>
                    )}
                  </button>
                  <button
                    onClick={isEditing ? cancelEdit : deleteRow}
                    type="button"
                    className="has-icon btn btn-secondary d-flex flex-center"
                  >
                    {isEditing ? (
                      <span className="material-icon inline-icon">cancel</span>
                    ) : (
                      <span className="material-icon inline-icon">delete</span>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </form>
  );
}
