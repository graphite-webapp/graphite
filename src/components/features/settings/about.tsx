import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';

export default function About() {
  return (
    <div>
      <SettingHeader title={'About'} />
      <div className={`${styles.container} d-flex gap-1`}>
        <a className="bold text-link" href="https://discord.gg/exakJqYPHA" target="blank">
          Discord
        </a>
        <a
          className="bold text-link"
          href="https://github.com/graphite-webapp/graphite"
          target="blank"
        >
          Github
        </a>
      </div>
    </div>
  );
}
