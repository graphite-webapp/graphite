import { useState, useRef } from 'react';
import { useUser } from '@/lib/userContext';
import { useFetchData, makeTableRequest } from '@/types/getData';
import { Tables } from '@/types/supabase';
import styles from '@/styles/modules/overview.module.scss';
import Spinner from '@/components/ui/spinner';
import OverviewDetails from './overviewDetails';
import { groupData } from '@/types/formatData';
import { sumDurations } from '@/types/dates';
import Submenu from '@/components/ui/submenu';
import { handleSubmit } from '@/types/submitData';
import { upsertData } from '@/types/upsertData';

type OverviewProps = {
  sessions: Tables<'sessions'>[];
  chapters: Tables<'chapters'>[];
  showControlMenu: boolean;
};

export default function Overview({
  sessions: initialSessions,
  chapters: initialChapters,
  showControlMenu = false,
}: OverviewProps) {
  const { currentUser, loading: userLoading } = useUser();
  const [editingRowId, setEditingRowId] = useState<string | boolean>(false);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
  const toggleButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const toggleSubmenu = (id: string) => {
    setActiveSubmenuId(prev => (prev === id ? null : id));
  };

  const cancelEdit = () => setEditingRowId(false);

  const [dataTable, setDataTable] = useState<'sessions' | 'chapters'>(() => {
    const saved = localStorage.getItem('dataTable');
    if (saved === 'sessions' || saved === 'chapters') return saved;
    return 'sessions';
  });

  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('collapsedDays');
    return saved !== null ? JSON.parse(saved) : {};
  });

  const date = new Date();
  const startPeriod = new Date(date.getFullYear(), 0, 1);
  const endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  const { data, loading: dataLoading } = useFetchData({
    src: 'component',
    userId: currentUser?.id,
    tables: [
      makeTableRequest({
        table: 'sessions',
        options: {
          order: [{ column: 'date', ascending: true }],
          gte: { date: startPeriod.toISOString().split('T')[0] },
          lte: { date: endPeriod.toISOString().split('T')[0] },
        },
      }),
      makeTableRequest({
        table: 'chapters',
        options: {
          order: [{ column: 'date', ascending: true }],
          gte: { date: startPeriod.toISOString().split('T')[0] },
          lte: { date: endPeriod.toISOString().split('T')[0] },
        },
      }),
    ] as const,
    initialData: { sessions: initialSessions, chapters: initialChapters },
  });

  const sessions =
    dataTable === 'sessions'
      ? groupData<'sessions'>(data.sessions ?? [], 'date')
      : groupData<'chapters'>(data.chapters ?? [], 'date');
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
  const removeKeys = ['id', 'date', 'user_id', 'created_at', 'updated_at'];
  const unshiftKeys: string[] = [];

  if (dataTable == 'sessions') {
    unshiftKeys.push('count', 'time');
    removeKeys.push('start_count', 'end_count', 'start_time', 'end_time');
  }

  removeKeys.forEach(k => {
    const i = headers.indexOf(k);
    if (i !== -1) headers.splice(i, 1);
  });

  if (unshiftKeys.length > 0) {
    unshiftKeys.forEach(k => {
      headers.unshift(k);
    });
  }

  const toggleCollapse = (dayKey: string) => {
    setCollapsedDays(prev => {
      const isCollapsed = prev[dayKey] ?? true;
      const updated = { ...prev, [dayKey]: !isCollapsed };
      localStorage.setItem('collapsedDays', JSON.stringify(updated));
      return updated;
    });
  };

  const editChapters = async (dayKey: string) => {
    const chaptersSessions = sessions[dayKey] as Tables<'chapters'>[];
    const currentData = chaptersSessions.reduce(
      (acc, session) => {
        acc.ids.push(Number(session.id));
        acc.chapters += Number(session.chapter_completed ?? 0);
        acc.date = session.date;
        return acc;
      },
      { ids: [] as number[], date: '', chapters: 0 }
    );

    const dateInput = document.getElementById(`date-${dayKey}`) as HTMLInputElement | null;
    const chaptersInput = document.getElementById(`chapters-${dayKey}`) as HTMLInputElement | null;

    if (!dateInput || !chaptersInput) return;

    const dateVal = dateInput.value;
    const chaptersVal = Number(chaptersInput.value);

    const chaptersDiff = chaptersVal - currentData.chapters;

    if (chaptersDiff < 0) {
      const idsToDelete = currentData.ids.slice(0, Math.abs(chaptersDiff));

      await handleSubmit({
        userId: currentUser.id,
        submitType: 'delete',
        table: dataTable,
        recordId: idsToDelete,
      });
      return;
    }

    if (chaptersDiff > 0) {
      const newRows = Array.from({ length: chaptersDiff }, () => ({
        user_id: currentUser.id,
        date: dateVal,
        chapter_completed: 1,
      }));

      await upsertData(dataTable, newRows as Tables<'chapters'>[]);
      location.reload();
      return;
    }

    const updatedRows = currentData.ids.map(id => ({
      id,
      user_id: currentUser.id,
      date: dateVal,
    }));

    await upsertData(dataTable, updatedRows as Tables<'chapters'>[]);
    location.reload();
  };

  const deleteChapters = async (dayKey: string) => {
    const recordIds = sessions[dayKey].map(session => Number(session.id));

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'delete',
      table: dataTable,
      recordId: recordIds,
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

          <section className="d-flex flex-col shadow-l overflow-x-scroll">
            <div className="min-w-max-content">
              {dataTable == 'sessions' ? (
                <div className="header-block d-flex justify-content-between gap-1 align-items-center">
                  <p>Date</p>
                  <p>Words written</p>
                  <p>Avg. WPM</p>
                  <p>Duration</p>
                  <p>
                    <span className="v-hidden material-icon">expand_more</span>
                  </p>
                </div>
              ) : (
                <div className="header-block d-flex justify-content-between gap-1 flex-wrap align-items-center">
                  <p>Date</p>
                  <p>Chapters</p>
                  <p> </p>
                </div>
              )}
              {Object.entries(sessions).map(([dayKey, daySessions]) => {
                const isEditing = editingRowId === dayKey;

                return (
                  <div key={dayKey} className={styles.sessionContainer}>
                    {dataTable == 'sessions' &&
                    Array.isArray(daySessions) &&
                    daySessions.length > 0 ? (
                      <button
                        className={`${styles.dayBlock} ${styles.containsDetails} ${!collapsedDays[dayKey] ? styles.detailsShown : ''} contains-details d-flex justify-content-between gap-1 w-fill day-block border-0 align-items-center`}
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
                            .reduce<number>(
                              (sum, session: Tables<'sessions'>) =>
                                sum + Number(session.words_written ?? 0),
                              0
                            )
                            .toLocaleString()}{' '}
                          words
                        </p>
                        <p>
                          {Math.round(
                            daySessions.reduce(
                              (sum: number, session: Tables<'sessions'>) =>
                                sum + Number(session.wpm ?? 0),
                              0
                            ) / daySessions.length
                          ).toLocaleString()}{' '}
                          WPM
                        </p>

                        <p>
                          {sumDurations(
                            daySessions.map(
                              (session: Tables<'sessions'>) => session.session_duration as string
                            )
                          )}
                        </p>

                        <p>
                          <span className="material-icon">
                            {(collapsedDays[dayKey] ?? true) ? 'expand_more' : 'expand_less'}
                          </span>
                        </p>
                      </button>
                    ) : (
                      <div
                        className={`${styles.dayBlock} d-flex justify-content-between gap-1 day-block flex-wrap border-0 align-items-center`}
                      >
                        {isEditing ? (
                          <div>
                            <input
                              id={`date-${dayKey}`}
                              type="date"
                              defaultValue={
                                typeof dayKey === 'string'
                                  ? new Date(dayKey).toISOString().split('T')[0]
                                  : ''
                              }
                              className={styles.input}
                            />
                          </div>
                        ) : (
                          <div>
                            <p>
                              {new Date(dayKey).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        )}

                        <div className="d-flex align-items-center gap-1ch">
                          {isEditing ? (
                            <input
                              id={`chapters-${dayKey}`}
                              type="number"
                              defaultValue={(daySessions as Tables<'chapters'>[]).reduce<number>(
                                (sum, session) => sum + Number(session.chapter_completed ?? 0),
                                0
                              )}
                              className={styles.input}
                            />
                          ) : (
                            <p>
                              {(daySessions as Tables<'chapters'>[])
                                .reduce<number>(
                                  (sum, session) => sum + Number(session.chapter_completed ?? 0),
                                  0
                                )
                                .toLocaleString()}
                            </p>
                          )}
                          <p>
                            {(daySessions as Tables<'chapters'>[]).reduce<number>(
                              (sum, session) => sum + Number(session.chapter_completed ?? 0),
                              0
                            ) > 1
                              ? ' chapters'
                              : ' chapter'}
                          </p>
                        </div>

                        <div>
                          <button
                            className="no-button"
                            type="button"
                            onClick={() => toggleSubmenu(dayKey)}
                            ref={el => {
                              toggleButtonRefs.current[dayKey] = el;
                            }}
                          >
                            <span className="material-icon inline-icon">more_horiz</span>
                          </button>

                          <Submenu
                            triggerEl={toggleButtonRefs.current[dayKey]}
                            open={activeSubmenuId === dayKey}
                            onClose={() => setActiveSubmenuId(null)}
                            options={[
                              {
                                text: !isEditing ? 'Edit session' : 'Submit edit',
                                icon: !isEditing ? 'edit' : 'check_circle',
                                onClick: () =>
                                  !isEditing ? setEditingRowId(dayKey) : editChapters(dayKey),
                              },
                              {
                                text: !isEditing ? 'Delete session' : 'Cancel edit',
                                icon: !isEditing ? 'delete' : 'cancel',
                                onClick: () => (!isEditing ? deleteChapters(dayKey) : cancelEdit()),
                                classes: ['color-error'],
                              },
                            ]}
                          />
                        </div>
                      </div>
                    )}

                    {dataTable == 'sessions' ? (
                      <div>
                        <OverviewDetails
                          collapsed={collapsedDays[dayKey] ?? true}
                          dataTable={dataTable}
                          headers={headers}
                          sessions={daySessions as Tables<'sessions'>[]}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="d-flex flex-center mt-2">
          <Spinner />
        </div>
      )}
    </section>
  );
}
