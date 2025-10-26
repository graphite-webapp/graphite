import styles from '@/styles/modules/settingCategory.module.scss';

export default function SettingHeader({ title, onClick }) {
  return (
    <h4 onClick={onClick} className={styles.title}>
      {title}
    </h4>
  );
}
