import RadioButton from '@/components/ui/radioButton';
import SettingsCategory from '../settingsCategory';

export default function Appearance() {
  return (
    <SettingsCategory
      title="Appearance"
      storageKey="appearance"
      defaultCollapsed={false}
      containerClasses={['d-flex', 'flex-col', 'gap-1']}
    >
      <RadioButton
        title={'Theme'}
        options={[
          { name: 'theme-system', label: 'System default', type: 'radio' },
          { name: 'theme-dark', label: 'Dark', type: 'radio' },
          { name: 'theme-light', label: 'Light', type: 'radio' },
        ]}
      />
    </SettingsCategory>
  );
}
