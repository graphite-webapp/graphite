'use client';
import { useUser } from '@/lib/userContext';
import { handleSubmit } from '@/types/submitData';
import styles from '@/styles/modules/submitSession.module.scss';
import Spinner from '@/components/ui/spinner';
import { useHandleData } from '@/types/getData';

export default function SubmitSession() {
  const { currentUser, loading: userLoading } = useUser();

  const { data, loading: dataLoading } = useHandleData({
    src: 'component',
    userId: currentUser?.id,
    tables: [{ table: 'sessions', orderBy: 'date', ascending: 0, limit: 1 }],
  });

  if (!currentUser || userLoading)
    return (
      <section className="info-block">
        <h3>Log writing session</h3>
        <div className=" d-flex flex-center">
          <Spinner />
        </div>
      </section>
    );

  let prevSession = null;
  if (!dataLoading && data.sessions.length > 0) {
    prevSession = data.sessions[0];
  }

  const insertRow = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!currentUser?.id) return;
    e.preventDefault();
    const form = e.currentTarget;
    await handleSubmit({
      userId: currentUser.id,
      submitType: 'insert',
      table: 'sessions',
      recordId: null,
      form,
      values: [
        { key: 'date', id: '#date', type: 'text' },
        { key: 'start_time', id: '#start-time', type: 'text' },
        { key: 'end_time', id: '#end-time', type: 'text' },
        { key: 'start_count', id: '#start-count', type: 'text' },
        { key: 'end_count', id: '#end-count', type: 'text' },
        { key: 'words_written', id: '', type: 'number' },
        { key: 'session_duration', id: '', type: 'text' },
        { key: 'wpm', id: '', type: 'number' },
        { key: 'chapter', id: '#chapter', type: 'array' },
      ],
    });
  };

  return (
    <section className="info-block">
      <h3>Log writing session</h3>
      <form className="d-flex flex-col gap-1" onSubmit={insertRow}>
        <div className={styles.grid}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
          ></input>

          <label htmlFor="start-time">Start time</label>
          <input id="start-time" type="time"></input>

          <label htmlFor="end-time">End time</label>
          <input id="end-time" type="time"></input>

          <label htmlFor="start-count">Start count</label>
          <input
            id="start-count"
            type="number"
            defaultValue={prevSession !== null ? Number(prevSession.end_count) : ''}
          ></input>

          <label htmlFor="end-count">End count</label>
          <input id="end-count" type="number"></input>

          <label htmlFor="chapter">Chapter(s)</label>
          <input
            id="chapter"
            type="text"
            defaultValue={prevSession !== null ? prevSession.chapter.join(', ') : ''}
          ></input>
        </div>
        <button className="btn btn-primary" type="submit">
          Submit session
        </button>
      </form>
    </section>
  );
}
