import { useUser } from '@/lib/userContext';
import { useHandleData } from '@/types/getData';
import { BaseRow } from '@/types/db';
import Spinner from '@/components/ui/spinner';

type ProgressProps = {
  type: 'month' | 'year';
  sessions: BaseRow[];
  goals: BaseRow[];
};

export default function Progress({
  type,
  sessions: initialSessions,
  goals: initialGoals,
}: ProgressProps) {
  const { currentUser } = useUser();

  const date = new Date();

  // year period
  let startPeriod = new Date(date.getFullYear(), 0, 1);
  let endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  if (type == 'month') {
    startPeriod = new Date(date.getFullYear(), date.getMonth());
    endPeriod = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  const { data, loading } = useHandleData(
    'component',
    currentUser?.id,
    ['sessions', 'goals'],
    startPeriod,
    endPeriod,
    { sessions: initialSessions, goals: initialGoals }
  );

  const sessions = data.sessions || [];
  const goals = data.goals || [];

  if (!currentUser || loading) {
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );
  }

  const totalWordsWritten = sessions.reduce(
    (sum, session) => sum + (session.words_written as number),
    0
  );
  // Only one goals entry possible
  const goal = goals[0]?.[type === 'month' ? 'monthly' : 'yearly'] ?? 0;
  const msInDay = 1000 * 60 * 60 * 24;
  const remainingDays = Math.floor((endPeriod.getTime() - new Date().getTime()) / msInDay);
  const remainingWeeks = Math.floor((endPeriod.getTime() - new Date().getTime()) / msInDay / 7);

  return (
    <section className="info-block">
      <h3>{type == 'year' ? 'Yearly progress' : 'Monthly progress'}</h3>
      <div className="d-grid grid-columns-1-1 gap-05 align-items-center">
        <p>{type == 'year' ? 'Yearly goal' : 'Monthly goal'}</p>
        <p>
          {totalWordsWritten.toLocaleString()} / {goal.toLocaleString()}
        </p>

        <p>Completion</p>
        <p>{Math.round((totalWordsWritten / (goal as number)) * 100).toLocaleString()}%</p>

        <p>Daily words needed</p>
        <p>
          {remainingDays > 0
            ? Math.ceil(((goal as number) - totalWordsWritten) / remainingDays).toLocaleString()
            : 0}
        </p>

        <p>Weekly words needed</p>
        <p>
          {remainingWeeks > 0
            ? Math.ceil(((goal as number) - totalWordsWritten) / remainingWeeks).toLocaleString()
            : 0}
        </p>
      </div>
    </section>
  );
}
