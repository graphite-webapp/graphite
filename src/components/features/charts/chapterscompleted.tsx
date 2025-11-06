import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useUser } from '@/lib/db/connection/userContext';
import { Tables } from '@/types/db/supabase';
import { useFetchData, makeTableRequest } from '@/lib/db/getData';
import { aggregateData, AggregationConfig } from '@/lib/db/formatData';
import Spinner from '@/components/ui/spinner';

type ChaptersCompletedProps = {
  chapters: Tables<'chapters'>[];
};

export default function ChaptersCompleted({ chapters: initialChapters }: ChaptersCompletedProps) {
  const { currentUser, loading: userLoading } = useUser();

  const date = new Date();
  const startPeriod = new Date(date.getFullYear(), 0, 1);
  const endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  const { data, loading: dataLoading } = useFetchData({
    src: 'component',
    userId: currentUser?.id,
    tables: [
      makeTableRequest({
        table: 'chapters',
        options: {
          order: [{ column: 'date', ascending: true }],
          gte: { date: startPeriod.toISOString().split('T')[0] },
          lte: { date: endPeriod.toISOString().split('T')[0] },
        },
      }),
    ],
    initialData: {
      chapters: initialChapters,
    },
  });

  const chapters = aggregateData(data.chapters as Tables<'chapters'>[], 'month', {
    chapter_completed: 'sum',
  } as AggregationConfig<Tables<'chapters'>>);

  if (!currentUser || userLoading) {
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );
  }

  if (chapters.length == 0) {
    return <p>No sessions done</p>;
  }

  return (
    <section className="info-block">
      <h3>Chapters completed</h3>
      <div className={dataLoading ? 'loading' : ''} style={{ width: '100%', height: '200px' }}>
        {!dataLoading ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chapters}>
              <CartesianGrid />
              <Bar dataKey="chapter_completed" fill="var(--primary)" />
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
        ) : null}
      </div>
    </section>
  );
}
