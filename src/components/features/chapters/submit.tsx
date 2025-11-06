import { upsertData } from '@/lib/db/upsertData';
import { useUser } from '@/lib/db/connection/userContext';

export default function SubmitChapter() {
  const { currentUser } = useUser();

  const addChapter = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentUser || !currentUser?.id) return;

    const chapterData = {
      user_id: currentUser?.id,
      date: new Date().toISOString(),
      chapter_completed: 1,
    };

    await upsertData('chapters', [chapterData]);
    location.reload();
  };

  const removeChapter = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentUser || !currentUser?.id) return;

    const chapterData = {
      user_id: currentUser?.id,
      date: new Date().toISOString(),
      chapter_completed: -1,
    };

    await upsertData('chapters', [chapterData]);
    location.reload();
  };

  return (
    <section className="info-block">
      <h3>Log chapter progress</h3>
      <div className="d-flex flex-col gap-1">
        <button className="btn btn-secondary" onClick={addChapter}>
          Mark chapter as completed
        </button>
        <button className="btn btn-secondary" onClick={removeChapter}>
          Mark chapter as not done
        </button>
      </div>
    </section>
  );
}
