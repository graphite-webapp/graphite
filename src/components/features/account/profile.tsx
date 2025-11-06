import { Tables } from '@/types/supabase';
import { useUser } from '@/lib/userContext';
import { useFetchData, makeTableRequest } from '@/types/getData';
import Spinner from '@/components/ui/spinner';
import ProfileInfo from '../../ui/profileInfo';
import { useState, useRef } from 'react';
import { capitalizeString } from '@/types/text';
import Link from 'next/link';
import styles from '@/styles/modules/profile.module.scss';
import { AvatarDefault } from '@/assets/avatar_default';
import Image from 'next/image';
import { upsertData, upsertAvatar } from '@/types/upsertData';
import { getAvatarSize } from '@/types/styles';
import React from 'react';
import { handleSubmit } from '@/types/submitData';
import { updateDisplayName } from '@/types/upsertData';
import Submenu from '@/components/ui/submenu';
import { deleteAvatar } from '@/types/deleteData';

type ProfileProps = {
  goals: Tables<'goals'>[];
  profiles: Tables<'profiles'>[];
  includeSettings: boolean;
  editingAllowed: boolean;
};

export default function Profile({
  goals: initialGoals,
  profiles: initialProfiles,
  includeSettings,
  editingAllowed,
}: ProfileProps) {
  const { currentUser, loading: userLoading } = useUser();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarButtonRef = useRef<HTMLButtonElement | null>(null);

  const { data } = useFetchData({
    src: 'component',
    userId: currentUser?.id,
    tables: [makeTableRequest({ table: 'goals' }), makeTableRequest({ table: 'profiles' })],
    initialData: {
      goals: initialGoals,
      profiles: initialProfiles,
    },
  });

  const goals = data.goals ?? [];
  const profileData = data.profiles ?? [];

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

  const avatarSize = getAvatarSize('id', 'avatar');

  const uploadAvatar = async (e: Event) => {
    if (!currentUser?.id) return;

    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const avatarUrl = await upsertAvatar(currentUser?.id, file);
    if (avatarUrl == null) return;

    await upsertData(
      'profiles',
      [
        {
          user_id: currentUser.id,
          avatar_url: avatarUrl,
        },
      ],
      true
    );

    location.reload();
  };

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!currentUser?.id) return;

    const form = e.currentTarget;

    await updateDisplayName(
      currentUser.id,
      (form.querySelector('#display_name') as HTMLInputElement).value
    );

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'update',
      table: 'profiles',
      recordId: [profileData[0].id ?? 0],
      form,
      values: [
        { key: 'bio', id: '#bio', type: 'text' },
        { key: 'pronouns', id: '#pronouns', type: 'text' },
      ],
    });

    setIsEditing(false);
  };

  return (
    <form
      id="profile-form"
      onSubmit={e => {
        e.preventDefault();
        saveProfileChanges(e);
      }}
    >
      <section className="info-block d-flex flex-col gap-1">
        <section className={`${styles.infoBlock} d-flex gap-1 align-items-center`}>
          {profileData[0].avatar_url !== null ? (
            <div className="p-relative">
              <Image
                id="avatar"
                src={String(profileData[0].avatar_url).trimEnd()}
                alt="Profile picture"
                className="avatar shadow-m"
                width={avatarSize}
                height={avatarSize}
              />
              {editingAllowed !== null && editingAllowed == true ? (
                <React.Fragment>
                  <button
                    ref={avatarButtonRef}
                    type="button"
                    className="btn-avatar d-flex flex-center has-icon"
                    onClick={() => setAvatarMenuOpen(prev => !prev)}
                  >
                    <span className="material-icon p">edit</span>
                  </button>

                  <Submenu
                    open={avatarMenuOpen}
                    onClose={() => setAvatarMenuOpen(false)}
                    triggerEl={avatarButtonRef.current}
                    options={[
                      {
                        text: 'Upload image',
                        icon: 'upload',
                        onClick: () => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = uploadAvatar;
                          input.click();
                        },
                      },
                      {
                        text: 'Remove avatar',
                        icon: 'delete',
                        onClick: async () => {
                          if (currentUser?.id) {
                            const success = await deleteAvatar(currentUser.id);
                            if (success) location.reload();
                          }
                        },
                        classes: ['color-error'],
                      },
                    ]}
                  />
                </React.Fragment>
              ) : null}
            </div>
          ) : (
            <AvatarDefault classes={['avatar']} />
          )}

          <div className="d-flex flex-col">
            {!isEditing ? (
              <h4 className="m-0" style={{ textTransform: 'none' }}>
                {currentUser.user_metadata.display_name}
              </h4>
            ) : (
              <input
                id="display_name"
                type="text"
                className="h4 m-0"
                style={{ textTransform: 'none' }}
                defaultValue={String(currentUser.user_metadata.display_name)}
              ></input>
            )}
            {!isEditing ? (
              <p className="small-text">{`${capitalizeString(profileData[0].pronouns as string)}`}</p>
            ) : (
              <input
                id="pronouns"
                type="text"
                className="small-text"
                defaultValue={`${capitalizeString(profileData[0].pronouns as string)}`}
              ></input>
            )}
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
          {editingAllowed !== null && editingAllowed == true ? (
            !isEditing ? (
              <div className="d-flex gap-1">
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="btn btn-primary mb-1"
                >
                  Edit profile
                </button>
              </div>
            ) : (
              <div className="d-flex gap-1 justify-content-between">
                <button type="submit" form="profile-form" className="btn btn-success mb-1">
                  Save profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-error mb-1"
                >
                  Discard changes
                </button>
              </div>
            )
          ) : null}

          <section className="d-flex flex-col gap-1">
            {/* PROFILE DATA */}
            <ProfileInfo title="Member since" info={String(createdAt)} />
            <ProfileInfo
              inputId="bio"
              isEditing={isEditing}
              type="textarea"
              title="Bio"
              info={String(profileData[0].bio)}
            />

            {/* GOALS */}
            {/* <div className="d-flex justify-content-between align-items-center">
              <ProfileInfo
                title="Goal type"
                info={`${capitalizeString(goals[0].type as string)}`}
              />

              <button className="btn btn-secondary has-icon d-flex flex-center">
                <span className="material-icon inline-icon">edit</span>
              </button>
            </div> */}

            <div className="d-flex justify-content-between align-items-center">
              <ProfileInfo
                title="Monthly goal"
                info={goals[0].monthly !== null ? goals[0].monthly.toLocaleString() : ''}
              />

              <button className="btn btn-secondary has-icon d-flex flex-center">
                <span className="material-icon inline-icon">edit</span>
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <ProfileInfo
                title="Yearly goal"
                info={goals[0].yearly !== null ? goals[0].yearly.toLocaleString() : ''}
              />

              <button className="btn btn-secondary has-icon d-flex flex-center">
                <span className="material-icon inline-icon">edit</span>
              </button>
            </div>
          </section>
        </section>
      </section>
    </form>
  );
}
