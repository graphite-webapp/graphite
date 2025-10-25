import { BaseRow } from '@/types/db';
import { useUser } from '@/lib/userContext';
import { useHandleData } from '@/types/getData';
import Option from '@/components/ui/option';
import { redirect } from 'next/navigation';
import Spinner from '@/components/ui/spinner';

type ProfileProps = {
  goals: BaseRow[];
};

export default function Profile({ goals: initialGoals }: ProfileProps) {
  const { currentUser, signOutUser, loading: userLoading } = useUser();

  const { data, loading: dataLoading } = useHandleData(
    'component',
    currentUser?.id,
    ['goals'],
    null,
    null,
    {
      goals: initialGoals,
    }
  );

  const goals = data.goals || [];

  if (!currentUser || userLoading) {
    return (
      <main className={`d-flex flex-center`}>
        <Spinner />
      </main>
    );
  }

  if (goals.length == 0) {
    return <p>No goals set</p>;
  }

  const createdAt = currentUser.created_at ? new Date(currentUser.created_at) : undefined;

  const handleSignOut = async () => {
    await signOutUser();
    redirect('/login');
  };

  return (
    <section className="info-block d-flex flex-col gap-1">
      <h1>Hello {!dataLoading ? currentUser.user_metadata.display_name : ''}</h1>
      <p className={dataLoading ? 'loading' : ''}>
        {!dataLoading ? `Member since ${createdAt?.toLocaleDateString()}` : ''}
      </p>
      <Option
        label="Bio"
        type="edit"
        value={'Nothing yet'}
        options={[]}
        loading={dataLoading}
        classNames={[]}
      />
      <Option
        label="Email"
        type="edit"
        value={!dataLoading ? currentUser.email : ''}
        options={[]}
        loading={dataLoading}
        classNames={[]}
      />

      <h3 className="mb-0 text-left">Goals</h3>

      <Option
        label="Goal type"
        type="edit"
        value={`${(goals[0].type as string).charAt(0).toUpperCase()}${(goals[0].type as string).slice(1).toLowerCase()}`}
        options={[]}
        loading={dataLoading}
        classNames={[]}
      />
      <Option
        label="Monthly goal"
        type="edit"
        value={(goals[0].monthly as string).toLocaleString()}
        options={[]}
        loading={dataLoading}
        classNames={[]}
      />
      <Option
        label="Yearly goal"
        type="edit"
        value={(goals[0].yearly as string).toLocaleString()}
        options={[]}
        loading={dataLoading}
        classNames={[]}
      />

      <hr />

      <button className="btn btn-error">Change password</button>
      <button className="btn btn-tertiary-error" onClick={handleSignOut}>
        Log out
      </button>
      <button className="btn btn-tertiary-error">Delete account</button>
    </section>
  );
}
