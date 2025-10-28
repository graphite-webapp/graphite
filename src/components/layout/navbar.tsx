'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/modules/navbar.module.scss';
import { AvatarDefault } from '@/assets/avatar_default';
import { BaseRow } from '@/types/db';
import { useHandleData } from '@/types/getData';
import Image from 'next/image';
import { useUser } from '@/lib/userContext';
import { getAvatarSize } from '@/types/styles';

type NavBarProps = {
  profiles?: BaseRow[];
};

export default function NavBar(profiles: initialProfiles): NavBarProps {
  const active = usePathname();
  const { currentUser, signOutUser, loading: userLoading } = useUser();

  const { data, loading: dataLoading } = useHandleData(
    'component',
    currentUser?.id,
    ['profiles'],
    null,
    null
  );

  const profileData = data.profiles || [];

  const avatarSize = getAvatarSize('class', '.nav-avatar-container');

  return (
    <header className={`${styles.navbar} d-flex flex-center`}>
      <nav className={styles.nav}>
        <ul className={`${styles.ul} d-flex gap-1 align-items-center justify-content-around`}>
          <li>
            <Link
              className={`${styles.link} ${active == '/' || active == '' ? styles.active : ''} has-icon d-flex flex-center`}
              href="/"
            >
              <span className={styles.text}>Home</span>
              <span className={`${styles.icon} material-icon`}>home</span>
            </Link>
          </li>
          <li>
            <Link
              className={`${styles.link} ${active?.startsWith('/stats') ? styles.active : ''} has-icon d-flex flex-center`}
              href="/stats"
            >
              <span className={styles.text}>Stats</span>
              <span className={`${styles.icon} material-icon`}>pie_chart</span>
            </Link>
          </li>
          <li>
            <Link
              className={`${styles.link} ${active?.startsWith('/sessions') ? styles.active : ''} has-icon d-flex flex-center`}
              href="/sessions"
            >
              <span className={styles.text}>Sessions</span>
              <span className={`${styles.icon} material-icon`}>note_alt</span>
            </Link>
          </li>
          <li>
            <Link className={`d-flex flex-center`} href="/profile">
              {profileData[0] !== undefined && profileData[0].avatar_url !== null ? (
                <div
                  className={`${active?.startsWith('/profile') ? 'avatar-active' : ''} nav-avatar-container`}
                >
                  <Image
                    id="avatar"
                    src={profileData[0].avatar_url.trimEnd()}
                    alt="Profile picture"
                    className={`${active?.startsWith('/profile') ? 'avatar-active' : ''} avatar`}
                    width={avatarSize}
                    height={avatarSize}
                  />
                </div>
              ) : (
                <div
                  className={`${active?.startsWith('/profile') ? 'avatar-active' : ''} nav-avatar-container`}
                >
                  <AvatarDefault
                    classes={['avatar', active?.startsWith('/profile') ? 'avatar-active' : '']}
                  />
                </div>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
