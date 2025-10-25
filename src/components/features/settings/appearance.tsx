import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';
import RadioButton from '@/components/ui/radioButton';

export default function Appearance() {
  return (
    <div>
      <SettingHeader title={'Appearance'} />
      <div className={`${styles.container} d-flex flex-col gap-1`}>
        <RadioButton
          title={'Theme'}
          options={[
            { name: 'theme-system', label: 'System default', type: 'radio' },
            { name: 'theme-dark', label: 'Dark', type: 'radio' },
            { name: 'theme-light', label: 'Light', type: 'radio' },
          ]}
        />
      </div>
    </div>
  );
}
