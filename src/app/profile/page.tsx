'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import { useHandleData } from '@/types/getData';
import Profile from '@/components/features/account/profileDetails';
import Settings from '@/components/features/settings/settings';
import Spinner from '@/components/ui/spinner';
import styles from '@/styles/modules/profile.module.scss';

export default function Home() {
  const { currentUser, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
  }, [currentUser, userLoading]);

  const { data, loading: dataLoading } = useHandleData('page', currentUser?.id, ['goals']);

  if (dataLoading || !currentUser || userLoading)
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );

  return (
    <main className={`${styles.container} d-flex gap-1`}>
      <section className="d-flex flex-col gap-1">
        <Profile goals={data.goals ?? []} />
      </section>

      <section className="d-flex flex-col gap-1">
        <Settings />
      </section>
    </main>
  );
}
