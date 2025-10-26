'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/modules/navbar.module.scss';
import { AvatarDefault } from '@/assets/avatar_default';

export default function NavBar() {
  const active = usePathname();
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
            <Link
              className={`${styles.link} ${active?.startsWith('/profile') ? styles.active : ''} has-icon d-flex flex-center`}
              href="/profile"
            >
              <AvatarDefault
                classes={[
                  'avatar nav-avatar',
                  active?.startsWith('/profile') ? 'avatar-active' : '',
                ]}
              />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
