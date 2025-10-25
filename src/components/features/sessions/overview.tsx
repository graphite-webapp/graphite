import { useState } from 'react';
import { useUser } from '@/lib/userContext';
import { useHandleData } from '@/types/getData';
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

  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('collapsedDays');
    return saved !== null ? JSON.parse(saved) : {};
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
                </div>
              )}
              {Object.entries(sessions).map(([dayKey, daySessions]) => (
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
                          .reduce(
                            (sum: number, session: DataRow) =>
                              sum + Number(session.words_written ?? 0),
                            0
                          )
                          .toLocaleString()}{' '}
                        words
                      </p>
                      <p>
                        {Math.round(
                          daySessions.reduce(
                            (sum: number, session: DataRow) => sum + Number(session.wpm ?? 0),
                            0
                          ) / daySessions.length
                        ).toLocaleString()}{' '}
                        WPM
                      </p>

                      <p>
                        {sumDurations(
                          daySessions.map((session: DataRow) => session.session_duration as string)
                        )}
                      </p>

                      <p>
                        <span className="material-icon">
                          {(collapsedDays[dayKey] ?? true) ? 'expand_more' : 'expand_less'}
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
                          .reduce(
                            (sum: number, session: DataRow) =>
                              sum + Number(session.chapter_completed ?? 0),
                            0
                          )
                          .toLocaleString()}
                        {daySessions.reduce(
                          (sum: number, session: DataRow) =>
                            sum + Number(session.chapter_completed ?? 0),
                          0
                        ) > 1
                          ? ' chapters'
                          : ' chapter'}
                      </p>
                    </button>
                  )}

                  {dataTable == 'sessions' ? (
                    <div>
                      <OverviewDetails
                        collapsed={collapsedDays[dayKey] ?? true}
                        dataTable={dataTable}
                        headers={headers}
                        sessions={daySessions}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
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
