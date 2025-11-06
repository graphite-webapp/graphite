import styles from '@/styles/modules/components/features/settings/settingCategory.module.scss';

type SettingHeaderProps = {
  title: string;
  onClick: () => void;
};

export default function SettingHeader({ title, onClick }: SettingHeaderProps) {
  return (
    <h4 onClick={onClick} className={styles.title}>
      {title}
    </h4>
  );
}
