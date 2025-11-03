'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import { useFetchData, makeTableRequest } from '@/types/getData';
import { useMetadata } from '@/lib/metadata';
import Glance from '@/components/features/stats/glance';
import Progress from '@/components/features/stats/progress';
import WordCount from '@/components/features/charts/wordcount';
import WordsWritten from '@/components/features/charts/wordswritten';
import ChaptersCompleted from '@/components/features/charts/chapterscompleted';
import styles from '@/styles/modules/stats.module.scss';
import Spinner from '@/components/ui/spinner';
import UserLoading from '@/components/ui/userLoading';

export default function Stats({ isMain = true }) {
  const Tag = isMain ? 'main' : 'section';
  const { currentUser, loading: userLoading } = useUser();
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
    if (!userLoading && currentUser && isMain) updateMetadata({ title: `Graphite | Stats` });
  }, [currentUser, userLoading, updateMetadata, isMain]);

  const { data, loading: dataLoading } = useFetchData({
    src: 'page',
    userId: currentUser?.id,
    tables: [
      makeTableRequest({
        table: 'sessions',
        options: {
          order: [{ column: 'date', ascending: true }],
        },
      }),
      makeTableRequest({
        table: 'chapters',
        options: {
          order: [{ column: 'date', ascending: true }],
        },
      }),
      makeTableRequest({ table: 'goals' }),
    ],
  });

  if (dataLoading || !currentUser || userLoading) {
    if (isMain && userLoading) return <UserLoading />;

    return (
      <Tag className={`d-flex flex-center`}>
        <Spinner />
      </Tag>
    );
  }

  return (
    <Tag className={`${styles.container}`}>
      <section className="d-flex flex-col gap-1">
        <Glance monthOffset="0" sessions={data.sessions ?? []} chapters={data.chapters ?? []} />
        <Glance monthOffset="-1" sessions={data.sessions ?? []} chapters={data.chapters ?? []} />
        <Progress type="month" sessions={data.sessions ?? []} goals={data.goals ?? []} />
        <Progress type="year" sessions={data.sessions ?? []} goals={data.goals ?? []} />
      </section>

      <section className="d-flex flex-col gap-1 flex-grow-1">
        <WordCount sessions={data.sessions ?? []} />
        <WordsWritten sessions={data.sessions ?? []} />
        <ChaptersCompleted chapters={data.chapters ?? []} />
      </section>
    </Tag>
  );
}
