import SettingsCategory from '../settingsCategory';
import { useUser } from '@/lib/db/connection/userContext';
import { redirect } from 'next/navigation';

export default function Account() {
  const { signOutUser } = useUser();

  const handleSignOut = async () => {
    await signOutUser();
    redirect('/login');
  };

  return (
    <SettingsCategory
      title="Account"
      storageKey="account"
      defaultCollapsed={true}
      containerClasses={['d-flex', 'flex-col', 'gap-2']}
    >
      <div className={`d-flex flex-col gap-05`}>
        <div>
          <p className="bold">Email</p>
          <input type="text" defaultValue={'example@example.com'}></input>
        </div>
        <button className="btn btn-secondary">Change password</button>
      </div>
      <div className={`d-flex flex-col gap-05`}>
        <button className="btn btn-tertiary-error" onClick={handleSignOut}>
          Log out
        </button>
        <button className="btn btn-tertiary-error">Delete account</button>
      </div>
    </SettingsCategory>
  );
}
