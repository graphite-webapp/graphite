import React from 'react';
import { useState, useRef } from 'react';
import { handleSubmit, submitValue } from '@/lib/db/submitData';
import { Tables } from '@/types/db/supabase';
import { useUser } from '@/lib/db/connection/userContext';
import Submenu from '@/components/ui/submenu';
import styles from '@/styles/modules/overviewDetails.module.scss';

type OverviewDetailsProps<T extends 'sessions'> = {
  collapsed: boolean;
  dataTable: T;
  headers: string[];
  sessions: Tables<T>[];
};

export default function OverviewDetails<T extends 'sessions'>({
  collapsed,
  dataTable,
  headers,
  sessions,
}: OverviewDetailsProps<T>) {
  const { currentUser, loading: userLoading } = useUser();
  const [editingRowId, setEditingRowId] = useState<number | boolean>(false);
  const [activeSubmenuId, setActiveSubmenuId] = useState<number | null>(null);
  const toggleButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const toggleSubmenu = (id: number) => {
    setActiveSubmenuId(prev => (prev === id ? null : id));
  };

  const editRow = (sessionId: number) => setEditingRowId(sessionId);
  const cancelEdit = () => setEditingRowId(false);

  const submitEdit = async (sessionId: number) => {
    if (!currentUser || userLoading) return;

    const row = document.querySelector(`div[data-id='${sessionId}']`) as HTMLDivElement;

    let editValues: submitValue[] = [
      { key: 'date', id: `#date-${sessionId}`, type: 'text' },
      { key: 'start_time', id: `#start-time-${sessionId}`, type: 'text' },
      { key: 'end_time', id: `#end-time-${sessionId}`, type: 'text' },
      { key: 'start_count', id: `#start-count-${sessionId}`, type: 'text' },
      { key: 'end_count', id: `#end-count-${sessionId}`, type: 'text' },
      { key: 'words_written', id: sessionId.toString(), type: 'number' },
      { key: 'session_duration', id: sessionId.toString(), type: 'text' },
      { key: 'wpm', id: sessionId.toString(), type: 'number' },
      { key: 'chapter', id: `#chapter-${sessionId}`, type: 'array' },
    ];

    editValues = [
      { key: 'date', id: `#date-${sessionId}`, type: 'text' },
      { key: 'chapter_completed', id: `#chapter-completed-${sessionId}`, type: 'number' },
    ];

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'update',
      table: dataTable,
      recordId: [Number(sessionId)],
      form: row,
      values: editValues,
    });

    setEditingRowId(false);
  };

  const deleteRow = async (sessionId: number) => {
    if (!currentUser || userLoading) return;

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'delete',
      table: dataTable,
      recordId: [Number(sessionId)],
    });
  };

  return (
    <form className={`${collapsed ? 'collapsed' : 'show d-flex'} ${styles.form}`}>
      <div className={styles.table}>
        <div className={styles.thead}>
          <div className={styles.tr}>
            {typeof editingRowId === 'number' ? <div className={styles.td}>Date</div> : null}
            {headers.map(header => {
              const withSpaces = (header as string).replace(/(_)/g, ' ');
              let formattedHeader =
                withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();

              if (header == 'wpm') {
                formattedHeader = 'WPM';
              }

              return (
                <div className={styles.td} key={header}>
                  {formattedHeader}
                </div>
              );
            })}
            <div className={styles.td}>Actions</div>
          </div>
        </div>
        <div className={styles.tbody}>
          {sessions.map(session => {
            const isEditing = editingRowId === session.id;

            return (
              <div className={styles.trBg} key={session.id}>
                <div className={styles.tr} data-id={session.id}>
                  {isEditing ? (
                    <React.Fragment>
                      <div className={`${styles.td} ${styles.valueLabel}`}>Date</div>
                      <div
                        className={`${styles.td} ${styles.edit_cell} d-flex align-items-center`}
                        data-label="date"
                      >
                        <div className="d-flex align-items-center">
                          <input
                            id={`date-${session.id}`}
                            className={styles.input}
                            type="date"
                            defaultValue={
                              typeof session['date'] === 'string'
                                ? new Date(session['date']).toISOString().split('T')[0]
                                : ''
                            }
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  ) : null}
                  {headers.map(header => {
                    const value = session[header as keyof typeof session] as unknown;
                    let displayValue = value as string | number | null;
                    const headerTitle = (header as string).toLowerCase();
                    const withSpaces = (header as string).replace(/(_)/g, ' ');
                    let formattedHeader =
                      withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();

                    if (header == 'wpm') {
                      formattedHeader = 'WPM';
                    }

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
                      displayValue = `${(session.start_count as number).toLocaleString()} - ${(session.end_count as number).toLocaleString()}`;
                    }

                    if (headerTitle == 'chapter') {
                      displayValue = (value as string[]).join(', ');
                    }

                    if (
                      isEditing &&
                      ['time', 'count', 'chapter', 'chapter_completed'].includes(header)
                    ) {
                      const headerTitle = (header as string).toLowerCase();
                      let type = 'text';
                      let output: React.ReactNode = (
                        <div className="d-flex align-items-center">
                          <input
                            id={`${header.replace(/(_)/g, '-')}-${session.id}`}
                            className={styles.input}
                            type={type}
                            defaultValue={displayValue as string}
                          />
                        </div>
                      );

                      if (headerTitle.includes('time')) {
                        type = 'time';
                      }

                      if (headerTitle.includes('count') || headerTitle == 'chapter_completed') {
                        type = 'number';
                      }

                      if (headerTitle.includes('count') || headerTitle.includes('time')) {
                        const startVal = (displayValue as string)
                          .split(' - ')[0]
                          .replace(',', '')
                          .replace('.', '');
                        const endVal = (displayValue as string)
                          .split(' - ')[1]
                          .replace(',', '')
                          .replace('.', '');
                        output = (
                          <div className="d-flex align-items-center gap-05">
                            <input
                              id={`start-${header.replace(/(_)/g, '-')}-${session.id}`}
                              className={styles.input}
                              type={type}
                              defaultValue={startVal as string}
                            />
                            <p>-</p>
                            <input
                              id={`end-${header.replace(/(_)/g, '-')}-${session.id}`}
                              className={styles.input}
                              type={type}
                              defaultValue={endVal as string}
                            />
                          </div>
                        );
                      }

                      return (
                        <React.Fragment key={header}>
                          <div className={`${styles.td} ${styles.valueLabel}`}>
                            {formattedHeader}
                          </div>
                          <div
                            className={`${styles.td} ${styles.edit_cell} d-flex align-items-center`}
                            data-label={formattedHeader}
                          >
                            {output}
                          </div>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={header}>
                        <div className={`${styles.td} ${styles.valueLabel}`}>{formattedHeader}</div>
                        <div className={`${styles.td} ${styles.value}`}>
                          {(displayValue as string).toLocaleString()}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div className={`${styles.td} ${styles.actions}`}>
                    <button
                      className="no-button"
                      type="button"
                      onClick={() => toggleSubmenu(Number(session.id))}
                      ref={el => {
                        toggleButtonRefs.current[Number(session.id)] = el;
                      }}
                    >
                      {' '}
                      <span className="material-icon inline-icon">more_horiz</span>
                    </button>
                    <Submenu
                      triggerEl={toggleButtonRefs.current[Number(session.id)]}
                      open={activeSubmenuId === session.id}
                      onClose={() => setActiveSubmenuId(null)}
                      options={[
                        {
                          text: !isEditing ? 'Edit session' : 'Submit edit',
                          icon: !isEditing ? 'edit' : 'check_circle',
                          onClick: () =>
                            !isEditing
                              ? editRow(Number(session.id))
                              : submitEdit(Number(session.id)),
                        },
                        {
                          text: !isEditing ? 'Delete session' : 'Cancel edit',
                          icon: !isEditing ? 'delete' : 'cancel',
                          onClick: () =>
                            !isEditing ? deleteRow(Number(session.id)) : cancelEdit(),
                          classes: ['color-error'],
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
