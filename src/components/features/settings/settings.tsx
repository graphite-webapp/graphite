import About from './categories/about';
import Account from './categories/account';
import Appearance from './categories/appearance';
import Data from './categories/data';
import Notifications from './categories/notifications';
import styles from '@/styles/modules/settings.module.scss';
import { useHandleData } from '@/types/getData';
import { useUser } from '@/lib/userContext';
import Spinner from '@/components/ui/spinner';

export default function Settings({ source }) {
  const { currentUser, loading: userLoading } = useUser();

  const { data, loading: dataLoading } = useHandleData({
    src: 'component',
    userId: currentUser?.id,
    tables: [{ table: 'settings' }],
  });

  if (!currentUser || userLoading || dataLoading || data.sessions?.length == 0) {
    return (
      <section
        className={`${source == 'profile' ? styles.container : 'd-flex'} info-block flex-col gap-1 flex-grow-1`}
      >
        <Spinner />
      </section>
    );
  }

  const settings = data.settings ?? [];

  return (
    <section
      className={`${source == 'profile' ? styles.container : 'd-flex'} info-block flex-col gap-1 flex-grow-1`}
    >
      <Account />
      <Notifications />
      <Data settings={settings[0]} />
      <Appearance settings={settings[0]} />
      <About />
    </section>
  );
}

// export default function Settings() {
//   return (
//     <section className="info-block d-flex flex-col gap-1">
//       <h5>Appearance</h5>
//       <Option
//         label="Theme"
//         type="select"
//         options={['System default', 'Light', 'Dark']}
//         classNames={[]}
//         value={''}
//         loading={false}
//       />

//       <h5>App settings</h5>
//       <Option
//         label="Calculate stats"
//         type="select"
//         options={['per session', 'per day']}
//         classNames={[]}
//         value={''}
//         loading={false}
//       />
//       <Option
//         label="Import data"
//         type="file-upload"
//         options={[]}
//         classNames={['btn-secondary']}
//         value={''}
//         loading={false}
//       />
//       <Option
//         label="Export data"
//         type="button"
//         options={[]}
//         classNames={['btn-secondary']}
//         value={''}
//         loading={false}
//       />
//     </section>
//   );
// }
