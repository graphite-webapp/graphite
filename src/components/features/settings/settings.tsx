import About from './categories/about';
import Account from './categories/account';
import Appearance from './categories/appearance';
import Data from './categories/data';
import Notifications from './categories/notifications';
import styles from '@/styles/modules/settings.module.scss';

type SettingsProps = {
  source: string;
};

export default function Settings({ source }: SettingsProps) {
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
