'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import { useHandleData } from '@/types/getData';
import Profile from '@/components/features/account/profileDetails';
import ProfileDetails from '@/components/features/account/profile';
import Settings from '@/components/features/settings/settings';
import Spinner from '@/components/ui/spinner';

export default function PageSettings() {
  const { currentUser, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
  }, [currentUser, userLoading]);

  const { data, loading: dataLoading } = useHandleData('page', currentUser?.id, [
    'goals',
    'profiles',
  ]);

  if (dataLoading || !currentUser || userLoading)
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
