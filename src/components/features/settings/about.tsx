import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';
import { GithubLogo } from '@/assets/github_logo';
import { DiscordLogo } from '@/assets/discord_logo';

export default function About() {
  return (
    <div>
      <SettingHeader title={'About Graphite'} />
      <div className={`${styles.container} d-flex gap-1`}>
        <a className="bold text-link" href="https://discord.gg/exakJqYPHA" target="blank">
          <DiscordLogo classes={['link-img']} />
        </a>
        <a
          className="bold text-link"
          href="https://github.com/graphite-webapp/graphite"
          target="blank"
        >
          <GithubLogo classes={['link-img']} />
        </a>
      </div>
    </div>
  );
}
