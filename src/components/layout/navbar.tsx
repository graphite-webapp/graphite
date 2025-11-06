'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/modules/components/layout/navbar.module.scss';
import { AvatarDefault } from '@/assets/avatar_default';
import { useFetchData } from '@/lib/db/getData';
import Image from 'next/image';
import { useUser } from '@/lib/db/connection/userContext';
import { getAvatarSize } from '@/lib/helpers/styles';

export default function NavBar() {
  const active = usePathname();
  const { currentUser, loading: userLoading } = useUser();

  const { data } = useFetchData({
    src: 'component',
    userId: currentUser?.id,
    tables: [{ table: 'profiles' }],
  });

  const profileData = data.profiles ?? [];

  const avatarSize = getAvatarSize('class', '.nav-avatar-container');

  if (!currentUser || userLoading) return;

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
                    src={String(profileData[0].avatar_url).trimEnd()}
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
