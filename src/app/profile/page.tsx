'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import { useFetchData } from '@/types/getData';
import Profile from '@/components/features/account/profile';
import Settings from '@/components/features/settings/settings';
import Spinner from '@/components/ui/spinner';
import styles from '@/styles/modules/profile.module.scss';
import UserLoading from '@/components/ui/userLoading';
import { useMetadata } from '@/lib/metadata';

export default function ProfileSettings() {
  const { currentUser, loading: userLoading } = useUser();
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
    if (!userLoading && currentUser)
      updateMetadata({ title: `Graphite | ${currentUser.user_metadata.display_name}` });
  }, [currentUser, userLoading, updateMetadata]);

  const { data, loading: dataLoading } = useFetchData({
    src: 'page',
    userId: currentUser?.id,
    tables: [{ table: 'goals' }, { table: 'profiles' }],
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
    <main className={`${styles.container} d-flex gap-1`}>
      <section className="d-flex flex-col gap-1">
        <Profile
          goals={data.goals ?? []}
          profiles={data.profiles ?? []}
          includeSettings={true}
          editingAllowed={true}
        />
      </section>

      <section className="d-flex flex-col gap-1">
        <Settings source={'profile'} />
      </section>
    </main>
  );
}
