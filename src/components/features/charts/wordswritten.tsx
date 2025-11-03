import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useUser } from '@/lib/userContext';
import { useFetchData } from '@/types/getData';
import { DataRow, aggregateData } from '@/types/formatData';
import { BaseRow } from '@/types/svg';
import Spinner from '@/components/ui/spinner';

type WordsWrittenProps = {
  sessions: BaseRow[];
};

export default function WordsWritten({ sessions: initialSessions }: WordsWrittenProps) {
  const { currentUser } = useUser();

  const date = new Date();
  const startPeriod = new Date(date.getFullYear(), 0, 1);
  const endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  const { data, loading } = useFetchData({
    src: 'component',
    userId: currentUser?.id,
    tables: [
      { table: 'sessions', orderBy: 'date', startPeriod: startPeriod, endPeriod: endPeriod },
    ],
    initialData: {
      sessions: initialSessions,
    },
  });

  const sessions =
    data.sessions.length > 0
      ? aggregateData(data.sessions as DataRow[], 'month', {
          words_written: 'sum',
        })
      : [];

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
      <h3>Words written</h3>
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sessions}>
            <CartesianGrid />
            <Bar dataKey="words_written" fill="var(--primary)" />
            <XAxis
              dataKey="date"
              tickFormatter={dateString => {
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, { month: 'short' });
              }}
            />
            <YAxis />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
