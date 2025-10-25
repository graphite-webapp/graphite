import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';
import RadioButton from '@/components/ui/radioButton';

export default function Data() {
  return (
    <div>
      <SettingHeader title={'Data'} />
      <div className={`${styles.container} d-flex flex-col gap-1`}>
        <RadioButton
          title={'Combine session data'}
          description={
            'In monthly glances, your stats can reflect a day’s worth of writing or individual sessions.'
          }
          options={[
            { name: 'per-day', label: 'Combine data by day', type: 'radio' },
            { name: 'per-session', label: 'Data by session', type: 'radio' },
          ]}
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
          options={[
            { name: 'export-single', label: 'Single file', type: 'radio' },
            { name: 'export-multiple', label: 'Multiple file', type: 'radio' },
            { name: 'export-btn', label: 'Export', type: 'button' },
          ]}
        />
      </div>
    </div>
  );
}
