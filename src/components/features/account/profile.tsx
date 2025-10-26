import { BaseRow } from '@/types/db';
import { useUser } from '@/lib/userContext';
import { useHandleData } from '@/types/getData';
import Option from '@/components/ui/option';
import { redirect } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import ProfileInfo from '../../ui/profileInfo';
import { useState } from 'react';
import { capitalizeString } from '@/types/text';
import { profileEnd } from 'console';
import Link from 'next/link';
import styles from '@/styles/modules/profile.module.scss';
import { AvatarDefault } from '@/assets/avatar_default';

type ProfileProps = {
  goals: BaseRow[];
  profiles: BaseRow[];
  includeSettings: boolean;
};

export default function ProfileDetails({
  goals: initialGoals,
  profiles: initialProfiles,
  includeSettings,
}: ProfileProps) {
  const { currentUser, signOutUser, loading: userLoading } = useUser();

  const { data, loading: dataLoading } = useHandleData(
    'component',
    currentUser?.id,
    ['goals', 'profiles'],
    null,
    null,
    {
      goals: initialGoals,
      profiles: initialProfiles,
    }
  );
  console.log(data.profiles);

  const goals = data.goals || [];
  const profileData = data.profiles || [];

  if (!currentUser || userLoading || profileData.length == 0) {
    return (
      <section className="info-block d-flex flex-center">
        <Spinner />
      </section>
    );
  }

  if (goals.length == 0) {
    return <p>No goals set</p>;
  }

  const createdAt = currentUser.created_at
    ? new Date(currentUser.created_at).toLocaleDateString()
    : undefined;

  return (
    <section className="info-block d-flex flex-col gap-1">
      <section className="d-flex gap-1 align-items-center">
        {profileData[0].avatar_url !== null ? (
          <div className="avatar"></div>
        ) : (
          <AvatarDefault classes={['avatar']} />
        )}

        <div>
          <h4 className="m-0" style={{ textTransform: 'none' }}>
            {currentUser.user_metadata.display_name}
          </h4>
          <p className="small-text">{`${capitalizeString(profileData[0].pronouns as string)}`}</p>
        </div>
        {includeSettings ? (
          <Link
            className={`${styles.settingsBtn} has-icon d-flex justify-content-end align-items-start flex-grow-1 h-4`}
            href="/profile/settings"
          >
            <span className="material-icon">settings</span>
          </Link>
        ) : null}
      </section>
      <section>
        <button className="btn btn-primary mb-1">Edit profile</button>
        <section className="d-flex flex-col gap-1">
          <ProfileInfo title="Member since" info={createdAt} />
          <ProfileInfo title="Bio" info={profileData[0].bio} />
          <ProfileInfo title="Goal type" info={`${capitalizeString(goals[0].type as string)}`} />
          <ProfileInfo title="Monthly goal" info={(goals[0].monthly as string).toLocaleString()} />
          <ProfileInfo title="Yearly goal" info={(goals[0].yearly as string).toLocaleString()} />
        </section>
      </section>
    </section>
  );
}
