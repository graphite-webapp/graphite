import styles from '@/styles/modules/userLoading.module.scss';

export default function UserLoading() {
  return (
    <main className={`${styles.container}`}>
      <div className={`${styles.circle}`}>
        <p className={`${styles.text}`}>G</p>
      </div>
    </main>
  );
}
