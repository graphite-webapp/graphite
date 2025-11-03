'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import Settings from '@/components/features/settings/settings';
import Spinner from '@/components/ui/spinner';
import { useMetadata } from '@/lib/metadata';

export default function PageSettings() {
  const { currentUser, loading: userLoading } = useUser();
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
    if (!userLoading && currentUser) updateMetadata({ title: `Graphite | Settings` });
  }, [currentUser, userLoading, updateMetadata]);

  if (!currentUser || userLoading)
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );

  return (
    <main className={`d-flex gap-1`}>
      <Settings source={'settings'} />
    </main>
  );
}
