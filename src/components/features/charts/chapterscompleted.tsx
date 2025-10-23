import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useUser } from '@/lib/userContext';
import { BaseRow } from '@/types/db';
import { useHandleData } from '@/types/getData';
import { DataRow, aggregateData } from '@/types/formatData';
import Spinner from '@/components/ui/spinner';

type ChaptersCompletedProps = {
  chapters: BaseRow[];
};

export default function ChaptersCompleted({ chapters: initialChapters }: ChaptersCompletedProps) {
  const { currentUser, loading: userLoading } = useUser();

  const date = new Date();
  const startPeriod = new Date(date.getFullYear(), 0, 1);
  const endPeriod = new Date(date.getFullYear() + 1, 0, 0);

  const { data, loading: dataLoading } = useHandleData(
    'component',
    currentUser?.id,
    ['chapters'],
    startPeriod,
    endPeriod,
    {
      chapters: initialChapters,
    }
  );

  const chapters = aggregateData(data.chapters as DataRow[], 'chapter_completed');

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
