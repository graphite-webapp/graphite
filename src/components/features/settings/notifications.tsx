import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';
import RadioButton from '@/components/ui/radioButton';

export default function Notifications() {
  return (
    <div>
      <SettingHeader title={'Notifications'} />
      <div className={`${styles.container} d-flex flex-col gap-1`}>
        <RadioButton
          title={'Emails'}
          options={[
            { name: 'email-major', label: 'Major updates (1.x)', type: 'checkbox' },
            { name: 'email-minor', label: 'Minor updates (1.x.x)', type: 'checkbox' },
            { name: 'email-none', label: 'No emails', type: 'radio' },
          ]}
        />
      </div>
    </div>
  );
}
