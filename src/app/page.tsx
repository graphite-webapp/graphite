'use client';
import { useEffect } from 'react';
import { useMetadata } from '@/lib/metadata';
import SubmitSession from '@/components/features/sessions/submit';
import SubmitChapter from '@/components/features/chapters/submit';
import Stats from '@/app/stats/page';

export default function Home() {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({ title: `Graphite | Dashboard` });
  }, [updateMetadata]);

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
