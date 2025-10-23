import { useState } from 'react';
import { useUser } from '@/lib/userContext';
import { useHandleData } from '@/types/getData';
import { handleSubmit } from '@/types/submitData';
import styles from '@/styles/modules/overview.module.scss';
import { BaseRow } from '@/types/db';
import Spinner from '@/components/ui/spinner';
import OverviewDetails from './overviewDetails';
import { DataRow, groupData } from '@/types/formatData';
import { sumDurations } from '@/types/dates';

type OverviewProps = {
  sessions: BaseRow[];
  chapters: BaseRow[];
  showControlMenu: boolean;
};

export default function Overview({
  sessions: initialSessions,
  chapters: initialChapters,
  showControlMenu = false,
}: OverviewProps) {
  const { currentUser, loading: userLoading } = useUser();
  const [dataTable, setDataTable] = useState<'sessions' | 'chapters'>(() => {
    const saved = localStorage.getItem('dataTable');
    if (saved === 'sessions' || saved === 'chapters') return saved;
    return 'sessions';
  });
  const [editingRowId, setEditingRowId] = useState<number | boolean>(false);
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('collapsedDays');
    return saved ? JSON.parse(saved) : {};
  });

  const date = new Date();
  const startPeriod = new Date(date.getFullYear(), 0, 1);
  const endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  const { data, loading: dataLoading } = useHandleData(
    'component',
    currentUser?.id,
    ['sessions', 'chapters'],
    startPeriod,
    endPeriod,
    { sessions: initialSessions, chapters: initialChapters }
  );

  const sessions = groupData(data[dataTable] as DataRow[], 'date');
  const groupsKeys = Object.keys(sessions);

  if (!currentUser || userLoading) {
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );
  }

  if (groupsKeys.length == 0) {
    return <p>No sessions done</p>;
  }

  const headers = Object.keys(sessions[groupsKeys[0]][0]);
  headers.splice(headers.indexOf('id'), 1);
  headers.splice(headers.indexOf('date'), 1);
  headers.splice(headers.indexOf('user_id'), 1);
  headers.splice(headers.indexOf('created_at'), 1);
  headers.splice(headers.indexOf('updated_at'), 1);
  if (dataTable == 'sessions') {
    headers.splice(headers.indexOf('start_count'), 1);
    headers.splice(headers.indexOf('end_count'), 1);
    headers.splice(headers.indexOf('start_time'), 1);
    headers.splice(headers.indexOf('end_time'), 1);

    headers.unshift('count');
    headers.unshift('time');
  }

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

  const toggleCollapse = (dayKey: string) => {
    setCollapsedDays(prev => {
      const isCollapsed = prev[dayKey] ?? true;
      const updated = { ...prev, [dayKey]: !isCollapsed };
      localStorage.setItem('collapsedDays', JSON.stringify(updated));
      console.log(updated);
      return updated;
    });
  };

  return (
    <section className="info-block">
      <h3>{dataTable == 'sessions' ? 'Writing sessions' : 'Chapter sessions'}</h3>
      {!dataLoading ? (
        <>
          <select
            className={`${showControlMenu ? 'd-flex' : 'd-none'} mb-1`}
            value={dataTable}
            onChange={e => {
              const value = e.target.value as 'sessions' | 'chapters';
              setDataTable(value);
              localStorage.setItem('dataTable', value);
            }}
          >
            <option value="sessions">Sessions</option>
            <option value="chapters">Chapters</option>
          </select>
          <section className="d-flex flex-col gap-1">
            {Object.entries(sessions).map(([dayKey, daySessions]) => (
              <div key={dayKey} className={styles.sessionContainer}>
                {dataTable == 'sessions' ? (
                  <button
                    className={`${styles.dayBlock} d-flex justify-content-between gap-1 day-block flex-wrap border-0 w-fill  align-items-center`}
                    onClick={() => toggleCollapse(dayKey)}
                  >
                    <p>
                      {new Date(dayKey).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    <p>
                      {daySessions
                        .reduce((sum, session) => sum + (session.words_written as number), 0)
                        .toLocaleString()}{' '}
                      words
                    </p>
                    <p>
                      {Math.round(
                        daySessions.reduce((sum, session) => sum + (session.wpm as number), 0) /
                          daySessions.length
                      ).toLocaleString()}{' '}
                      WPM
                    </p>

                    <p>{sumDurations(daySessions.map(s => s.session_duration as string))}</p>

                    <p>
                      <span className="material-icon">
                        {collapsedDays[dayKey] !== undefined ? 'expand_less' : 'expand_more'}
                      </span>
                    </p>
                  </button>
                ) : (
                  <button
                    className={`${styles.dayBlock} d-flex justify-content-between gap-1 day-block flex-wrap border-0 w-fill  align-items-center`}
                    onClick={() => toggleCollapse(dayKey)}
                  >
                    <p>
                      {new Date(dayKey).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    <p>
                      {daySessions
                        .reduce((sum, session) => sum + (session.chapter_completed as number), 0)
                        .toLocaleString()}
                      {daySessions
                        .reduce((sum, session) => sum + (session.chapter_completed as number), 0)
                        .toLocaleString() > 1
                        ? ' chapters'
                        : ' chapter'}
                    </p>
                  </button>
                )}

                {dataTable == 'sessions' ? (
                  <OverviewDetails
                    collapsed={collapsedDays[dayKey] ?? true}
                    dataTable={dataTable}
                    headers={headers}
                    sessions={daySessions}
                  />
                ) : null}
              </div>
            ))}{' '}
          </section>
        </>
      ) : (
        <div className="d-flex flex-center mt-2">
          <Spinner />
        </div>
      )}
    </section>
  );

  // return (
  //   <section className="info-block">
  //     <h3>{dataTable == 'sessions' ? 'Writing sessions' : 'Chapter sessions'}</h3>
  //     {!dataLoading ? (
  //       <>
  //         <select
  //           className={showControlMenu ? 'd-flex' : 'd-none'}
  //           value={dataTable}
  //           onChange={e => {
  //             const value = e.target.value as 'sessions' | 'chapters';
  //             setDataTable(value);
  //             localStorage.setItem('dataTable', value);
  //           }}
  //         >
  //           <option value="sessions">Sessions</option>
  //           <option value="chapters">Chapters</option>
  //         </select>
  //         <form className={`${styles.form} d-flex`} onSubmit={insertRow}>
  //           <table cellSpacing="0">
  //             <thead>
  //               <tr>
  //                 {headers.map(header => {
  //                   const withSpaces = header.replace(/(_)/g, ' ');

  //                   let formattedHeader =
  //                     withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();

  //                   if (header == 'wpm') {
  //                     formattedHeader = 'WPM';
  //                   }
  //                   return <td key={header}>{formattedHeader}</td>;
  //                 })}
  //                 <td>Options</td>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {sessions.map(session => {
  //                 const isEditing = editingRowId === session.id;

  //                 return (
  //                   <tr key={session.id} data-id={session.id}>
  //                     {headers.map(header => {
  //                       const value = session[header as keyof typeof session];
  //                       const headerTitle = header.toLowerCase();
  //                       let displayValue = value;
  //                       if (headerTitle.includes('date')) {
  //                         displayValue = new Date(value as string).toLocaleDateString();
  //                       }

  //                       if (
  //                         headerTitle.includes('start_time') ||
  //                         headerTitle.includes('end_time') ||
  //                         headerTitle.includes('session_duration')
  //                       ) {
  //                         const [hours, minutes] = (value as string).split(':');
  //                         const dateObj = new Date();
  //                         dateObj.setHours(Number(hours), Number(minutes));
  //                         displayValue = dateObj.toLocaleTimeString([], {
  //                           hour: '2-digit',
  //                           minute: '2-digit',
  //                         });
  //                       }

  //                       if (headerTitle == 'chapter') {
  //                         displayValue = (value as string[]).join(', ');
  //                       }

  //                       if (
  //                         isEditing &&
  //                         [
  //                           'date',
  //                           'start_time',
  //                           'end_time',
  //                           'start_count',
  //                           'end_count',
  //                           'chapter',
  //                           'chapter_completed',
  //                         ].includes(header)
  //                       ) {
  //                         let type = 'text';
  //                         if (header.includes('date')) {
  //                           type = 'date';
  //                           displayValue = new Date(value as string).toISOString().split('T')[0];
  //                         }

  //                         if (header.includes('time')) {
  //                           type = 'time';
  //                         }

  //                         if (header.includes('count') || header == 'chapter_completed') {
  //                           type = 'number';
  //                         }

  //                         return (
  //                           <td key={header} className={styles.edit_cell}>
  //                             <input
  //                               id={`${header.replace(/(_)/g, '-')}-${session.id}`}
  //                               type={type}
  //                               defaultValue={displayValue as string}
  //                             ></input>
  //                           </td>
  //                         );
  //                       }

  //                       return <td key={header}>{(displayValue as string).toLocaleString()}</td>;
  //                     })}
  //                     <td className="d-flex gap-05">
  //                       <button
  //                         onClick={isEditing ? submitEdit : editRow}
  //                         type="button"
  //                         className="btn btn-primary"
  //                       >
  //                         {isEditing ? 'Submit' : 'Edit'}
  //                       </button>
  //                       <button
  //                         onClick={isEditing ? cancelEdit : deleteRow}
  //                         type="button"
  //                         className="btn btn-secondary"
  //                       >
  //                         {isEditing ? 'Cancel' : 'Delete'}
  //                       </button>
  //                     </td>
  //                   </tr>
  //                 );
  //               })}
  //               <tr className={styles.form_row}>
  //                 {headers.map(header => {
  //                   const withSpaces = header.replace(/(_)/g, ' ');
  //                   const formattedHeader =
  //                     withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
  //                   let type = 'text';

  //                   if (
  //                     ![
  //                       'date',
  //                       'start_time',
  //                       'end_time',
  //                       'start_count',
  //                       'end_count',
  //                       'chapter',
  //                       'chapter_completed',
  //                     ].includes(header)
  //                   ) {
  //                     return <td key={header}></td>;
  //                   }

  //                   if (header.includes('date')) {
  //                     type = 'date';
  //                   }

  //                   if (header.includes('time')) {
  //                     type = 'time';
  //                   }

  //                   if (header.includes('count') || header == 'chapter_completed') {
  //                     type = 'number';
  //                   }

  //                   return (
  //                     <td key={header}>
  //                       <input
  //                         placeholder={formattedHeader}
  //                         id={header.replace(/(_)/g, '-')}
  //                         type={type}
  //                       ></input>
  //                     </td>
  //                   );
  //                 })}
  //                 <td>
  //                   <button className={`btn btn-primary ${styles.btn_submit}`} type="submit">
  //                     Submit session
  //                   </button>
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //         </form>
  //       </>
  //     ) : (
  //       <div className="d-flex flex-center mt-2">
  //         <Spinner />
  //       </div>
  //     )}
  //   </section>
  // );
}
