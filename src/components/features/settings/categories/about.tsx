import { GithubLogo } from '@/assets/github_logo';
import { DiscordLogo } from '@/assets/discord_logo';
import SettingsCategory from '../settingsCategory';

export default function About() {
  return (
    <SettingsCategory
      title="About Graphite"
      storageKey="about"
      defaultCollapsed={false}
      containerClasses={['d-flex', 'flex-col', 'gap-05']}
    >
      {/* BETA TESTER */}
      <p>Sign up as a beta tester</p>

      {/* PRIVACY */}
      <p>Find out what we do with your data here.</p>

      {/* BUG REPORT */}
      <p>You can report bugs here.</p>

      {/* LINKS */}
      <div className="d-flex gap-1">
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
    </SettingsCategory>
  );
}
