'use client';
import { redirect } from 'next/navigation';
import { useUser } from '@/lib/userContext';
import { useEffect } from 'react';
import { useHandleData } from '@/types/getData';
// import Profile from '@/components/features/account/profileDetails';
import ProfileDetails from '@/components/features/account/profile';
import Settings from '@/components/features/settings/settings';
import Spinner from '@/components/ui/spinner';
import styles from '@/styles/modules/profile.module.scss';
import UserLoading from '@/components/ui/userLoading';

export default function ProfileSettings() {
  const { currentUser, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !currentUser) redirect('/login');
  }, [currentUser, userLoading]);

  const { data, loading: dataLoading } = useHandleData('page', currentUser?.id, [
    'goals',
    'profiles',
  ]);

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
        {/* <Profile goals={data.goals ?? []} /> */}
        <ProfileDetails goals={data.goals ?? []} includeSettings={true} editingAllowed={true} />
      </section>

      <section className="d-flex flex-col gap-1">
        <Settings source={'profile'} />
      </section>
    </main>
  );
}
