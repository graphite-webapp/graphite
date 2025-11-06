import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useUser } from '@/lib/db/connection/userContext';
import { useFetchData, makeTableRequest } from '@/lib/db/getData';
import { aggregateData, AggregationConfig } from '@/lib/db/formatData';
import { Tables } from '@/types/db/supabase';
import Spinner from '@/components/ui/spinner';

type WordsWrittenProps = {
  sessions: Tables<'sessions'>[];
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
      makeTableRequest({
        table: 'sessions',
        options: {
          order: [{ column: 'date', ascending: true }],
          gte: { date: startPeriod.toISOString().split('T')[0] },
          lte: { date: endPeriod.toISOString().split('T')[0] },
        },
      }),
    ] as const,
    initialData: {
      sessions: initialSessions,
    },
  });

  const sessions =
    data.sessions !== undefined && data.sessions.length > 0
      ? aggregateData(data.sessions as Tables<'sessions'>[], 'month', {
          words_written: 'sum',
        } as AggregationConfig<Tables<'sessions'>>)
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
