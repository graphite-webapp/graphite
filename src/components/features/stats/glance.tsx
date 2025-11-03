import { useUser } from '@/lib/userContext';
import { useFetchData, makeTableRequest } from '@/types/getData';
import { Tables } from '@/types/supabase';
import Spinner from '@/components/ui/spinner';
import { aggregateData } from '@/types/formatData';

type GlanceProps = {
  monthOffset: string;
  sessions: Tables<'sessions'>[];
  chapters: Tables<'chapters'>[];
};

export default function Glance({
  monthOffset,
  sessions: initialSessions,
  chapters: initialChapters,
}: GlanceProps) {
  const monthOffsetNum = Number(monthOffset);

  const date = new Date();
  date.setMonth(date.getMonth() + monthOffsetNum);

  const { currentUser, loading: userLoading, settings } = useUser();

  const startPeriod = new Date(date.getFullYear(), date.getMonth());
  const endPeriod = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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

  if (!currentUser || userLoading) {
    return <Spinner />;
  }

  let sessions = data.sessions ?? [];
  if (settings.data_calc == 'per day') {
    sessions = aggregateData<'sessions'>(sessions, 'day', {
      start_count: 'min',
      end_count: 'max',
      words_written: 'sum',
      wpm: 'avg',
    });
  }
  const chapters = data.chapters ?? [];

  let sessionsDone = true;

  if (sessions.length == 0) {
    sessionsDone = false;
  }

  let title = `${date.toLocaleString('default', { month: 'long' })} at a glance`;

  if (monthOffsetNum == 0) {
    title = 'This month at a glance';
  }

  if (monthOffsetNum == -1) {
    title = 'Last month at a glance';
  }

  return (
    <section className="info-block">
      <h3>{title}</h3>
      <div
        className={`${sessionsDone ? 'd-grid' : 'd-none'} grid-columns-1-1 gap-05 align-items-center`}
      >
        <p>Sessions</p>
        <p className={dataLoading ? 'loading' : ''}>{dataLoading ? '' : sessions.length}</p>

        <p>Chapter(s) completed</p>
        <p className={dataLoading ? 'loading' : ''}>
          {dataLoading
            ? ''
            : chapters.reduce((sum, chapter) => sum + (chapter.chapter_completed as number), 0)}
        </p>

        <p>Words written</p>
        <p className={dataLoading ? 'loading' : ''}>
          {dataLoading
            ? ''
            : sessions
                .reduce((sum, session) => sum + (session.words_written as number), 0)
                .toLocaleString()}
        </p>

        <p>Average words written</p>
        <p className={dataLoading ? 'loading' : ''}>
          {dataLoading
            ? ''
            : Math.round(
                sessions.reduce((sum, session) => sum + (session.words_written as number), 0) /
                  sessions.length
              ).toLocaleString()}
        </p>

        <p>Most words written</p>
        <p className={dataLoading ? 'loading' : ''}>
          {dataLoading
            ? ''
            : sessions
                .reduce((max, session) => {
                  return (session.words_written as number) > max
                    ? (session.words_written as number)
                    : max;
                }, 0)
                .toLocaleString()}
        </p>

        <p>Average WPM</p>
        <p className={dataLoading ? 'loading' : ''}>
          {dataLoading
            ? ''
            : Math.round(
                sessions.reduce((sum, session) => sum + (session.wpm as number), 0) /
                  sessions.length
              ).toLocaleString()}
        </p>

        <p>Highest WPM</p>
        <p className={dataLoading ? 'loading' : ''}>
          {dataLoading
            ? ''
            : sessions
                .reduce((max, session) => {
                  return (session.wpm as number) > max ? (session.wpm as number) : max;
                }, 0)
                .toLocaleString()}
        </p>
      </div>

      <div className={`${sessionsDone ? 'd-none' : 'd-flex'} flex-center`}>
        <p>No sessions done</p>
      </div>
    </section>
  );
}
