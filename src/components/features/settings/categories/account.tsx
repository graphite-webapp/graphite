import SettingsCategory from '../settingsCategory';

export default function Account() {
  return (
    <SettingsCategory
      title="Account"
      storageKey="account"
      defaultCollapsed={true}
      containerClasses={['d-flex', 'flex-col', 'gap-1']}
    >
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
    </SettingsCategory>
  );
}
