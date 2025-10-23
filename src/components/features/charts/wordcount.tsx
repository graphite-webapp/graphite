import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useUser } from '@/lib/userContext';
import { useHandleData } from '@/types/getData';
import { BaseRow } from '@/types/db';
import Spinner from '@/components/ui/spinner';

type WordCountProps = {
  sessions: BaseRow[];
};

export default function WordCount({ sessions: initialSessions }: WordCountProps) {
  const { currentUser } = useUser();

  const date = new Date();
  const startPeriod = new Date(date.getFullYear(), 0, 1);
  const endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  const { data, loading } = useHandleData(
    'component',
    currentUser?.id,
    ['sessions'],
    startPeriod,
    endPeriod,
    {
      sessions: initialSessions,
    }
  );

  const sessions = data.sessions || [];

  if (!currentUser || loading) {
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );
  }

  if (sessions.length == 0) {
    return <p>No sessions done</p>;
  }

  return (
    <section className="info-block">
      <h3>Word count</h3>
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sessions}>
            <CartesianGrid />
            <Line dataKey="end_count" stroke="var(--primary)" strokeWidth={4} dot={false} />
            <XAxis
              dataKey="date"
              tickFormatter={dateString => {
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
