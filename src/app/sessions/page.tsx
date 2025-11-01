'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import { useHandleData } from '@/types/getData';
import Overview from '@/components/features/sessions/overview';
import Spinner from '@/components/ui/spinner';
import UserLoading from '@/components/ui/userLoading';

export default function Sessions() {
  const { currentUser, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
  }, [currentUser, userLoading]);

  const { data, loading: dataLoading } = useHandleData({
    src: 'page',
    userId: currentUser?.id,
    tables: [
      { table: 'sessions', orderBy: 'date' },
      { table: 'chapters', orderBy: 'date' },
    ],
  });

  if (dataLoading || !currentUser || userLoading) {
    if (userLoading) return <UserLoading />;

    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );
  }

  return (
    <main className="d-flex flex-col gap-1">
      <Overview
        sessions={data.sessions ?? []}
        chapters={data.chapters ?? []}
        showControlMenu={true}
      />
    </main>
  );
}
