import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';

export default function Account() {
  return (
    <div>
      <SettingHeader title={'Account'} />
      <div className={`${styles.container} d-flex flex-col gap-1`}>
        <div className={`d-flex flex-col gap-05`}>
          <div>
            <p className="bold">Email</p>
            <input type="text" defaultValue={'example@example.com'}></input>
          </div>
          <button className="btn btn-secondary">Change password</button>
        </div>
        <div className={`d-flex flex-col gap-05`}>
          <button className="btn btn-tertiary-error">Log out</button>
          <button className="btn btn-tertiary-error">Delete account</button>
        </div>
      </div>
    </div>
  );
}
