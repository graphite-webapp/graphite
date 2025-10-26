import { GithubLogo } from '@/assets/github_logo';
import { DiscordLogo } from '@/assets/discord_logo';
import SettingsCategory from '../settingsCategory';

export default function About() {
  return (
    <SettingsCategory
      title="About Graphite"
      storageKey="about"
      defaultCollapsed={false}
      containerClasses={['d-flex', 'gap-1']}
    >
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
    </SettingsCategory>
  );
}
