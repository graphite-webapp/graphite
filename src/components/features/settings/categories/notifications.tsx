import RadioButton from '@/components/ui/radioButton';
import SettingsCategory from '../settingsCategory';

export default function Notifications() {
  return (
    <SettingsCategory
      title="Notifications"
      storageKey="notifications"
      defaultCollapsed={false}
      containerClasses={['d-flex', 'flex-col', 'gap-1']}
    >
      <RadioButton
        title={'Emails'}
        options={[
          { name: 'email-major', label: 'Major updates (1.x)', type: 'checkbox' },
          { name: 'email-minor', label: 'Minor updates (1.x.x)', type: 'checkbox' },
          { name: 'email-none', label: 'No emails', type: 'radio' },
        ]}
      />
    </SettingsCategory>
  );
}
