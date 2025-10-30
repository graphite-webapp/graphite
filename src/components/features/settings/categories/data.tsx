import RadioButton from '@/components/ui/radioButton';
import SettingsCategory from '../settingsCategory';
import { handleSubmit } from '@/types/submitData';
import { useUser } from '@/lib/userContext';

export default function Data({ settings }) {
  const { currentUser, loading: userLoading, settings: userSettings, setSetting } = useUser();

  const upsertSetting = async (setting, value) => {
    if (!currentUser) return;

    if (setting == 'data-calc') setSetting('data_calc', value.replace('-', ' '));

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
      title="Data"
      storageKey="data"
      defaultCollapsed={false}
      containerClasses={['d-flex', 'flex-col', 'gap-1']}
    >
      <RadioButton
        title={'Combine session data'}
        description={
          'In monthly glances, your stats can reflect a day’s worth of writing or individual sessions.'
        }
        formName={'data-calc'}
        options={[
          { name: 'per-day', label: 'Combine data by day', type: 'radio' },
          { name: 'per-session', label: 'Data by session', type: 'radio' },
        ]}
        setting={settings?.data_calc ?? null}
        onChange={upsertSetting}
      />
      <RadioButton
        title={'Import'}
        description={
          'Importing will update existing rows or insert new ones. Check out this guide for how to set up your CSV file for importing.'
        }
        options={[{ name: 'import-btn', label: 'Import', type: 'button' }]}
      />
      <RadioButton
        title={'Export'}
        description={
          'Export all your data. If you choose single file, it will be exported as a XLSX file instead of CSV.'
        }
        formName={'export'}
        options={[
          { name: 'export-single', label: 'Single file', type: 'radio' },
          { name: 'export-multiple', label: 'Multiple file', type: 'radio' },
          { name: 'export-btn', label: 'Export', type: 'button' },
        ]}
      />
    </SettingsCategory>
  );
}
