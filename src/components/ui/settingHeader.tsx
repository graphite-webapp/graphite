import styles from '@/styles/modules/settingCategory.module.scss';

export default function SettingHeader({ title }) {
  return <h4 className={styles.title}>{title}</h4>;
}
