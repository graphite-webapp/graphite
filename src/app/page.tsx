'use client';
import SubmitSession from '@/components/features/sessions/submit';
import SubmitChapter from '@/components/features/chapters/submit';
import Stats from '@/app/stats/page';

export default function Home() {
  return (
    <main className="d-flex flex-col gap-2">
      <section className="info-blocks-container">
        <SubmitSession />
        <SubmitChapter />
      </section>

      <Stats isMain={false} />
    </main>
  );
}
