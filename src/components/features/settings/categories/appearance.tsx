import RadioButton from '@/components/ui/radioButton';
import SettingsCategory from '../settingsCategory';
import { handleSubmit } from '@/lib/db/submitData';
import { useUser } from '@/lib/db/connection/userContext';

export default function Appearance() {
  const { currentUser, settings, setSetting } = useUser();

  const upsertSetting = async ({ key, value }) => {
    if (!currentUser) return;

    if (key == 'theme') {
      setSetting('theme', value.replace('-', ' '));
      location.reload();
      return;
    }

    const form = document.getElementById(key) as HTMLFormElement | null;
    if (!form) return;

    await handleSubmit({
      userId: currentUser.id,
      submitType: 'update',
      table: 'settings',
      form,
      values: [{ key: key.replace('-', '_'), id: '#' + value, type: 'radio' }],
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
