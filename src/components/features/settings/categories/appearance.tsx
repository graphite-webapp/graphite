import RadioButton from '@/components/ui/radioButton';
import SettingsCategory from '../settingsCategory';
import { handleSubmit } from '@/types/submitData';
import { useUser } from '@/lib/userContext';

export default function Appearance({ settings }) {
  const { currentUser, loading: userLoading, setting, setSetting } = useUser();

  const upsertSetting = async (setting, value) => {
    if (!currentUser) return;

    if (setting == 'theme') setSetting('theme', value.replace('-', ' '));

    const form = document.getElementById(setting);
    await handleSubmit({
      userId: currentUser.id,
      submitType: 'update',
      table: 'settings',
      form,
      values: [{ key: setting.replace('-', '_'), id: '#' + value, type: 'radio' }],
    });
  };

  return (
    <SettingsCategory
      title="Appearance"
      storageKey="appearance"
      defaultCollapsed={false}
      containerClasses={['d-flex', 'flex-col', 'gap-1']}
    >
      <RadioButton
        title={'Theme'}
        formName={'theme'}
        options={[
          { name: 'system', label: 'System default', type: 'radio' },
          { name: 'dark', label: 'Dark', type: 'radio' },
          { name: 'light', label: 'Light', type: 'radio' },
        ]}
        setting={settings?.theme ?? null}
        onChange={upsertSetting}
      />
    </SettingsCategory>
  );
}
