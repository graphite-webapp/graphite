import Option from '../../ui/option';
import About from './about';
import Account from './account';
import Appearance from './appearance';
import Data from './data';
import Notifications from './notifications';
import styles from '@/styles/modules/settings.module.scss';

export default function Settings({ source }) {
  return (
    <section
      className={`${source == 'profile' ? styles.container : 'd-flex'} info-block flex-col gap-1 flex-grow-1`}
    >
      <Account />
      <Notifications />
      <Data />
      <Appearance />
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
