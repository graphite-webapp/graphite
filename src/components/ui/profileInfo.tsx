import styles from '@/styles/modules/components/ui/profileInfo.module.scss';

type ProfileInfoProps = {
  title: string;
  info: string;
  isEditing?: boolean;
  type?: string;
  inputId?: string;
};

export default function ProfileInfo({ title, info, isEditing, type, inputId }: ProfileInfoProps) {
  if (isEditing !== null && isEditing == true) {
    return (
      <div>
        <p className="bold">{title}</p>
        {type !== 'textarea' ? (
          <input
            id={inputId !== null ? inputId : ''}
            className={styles.input}
            type={type}
            defaultValue={info}
          ></input>
        ) : (
          <textarea
            id={inputId !== null ? inputId : ''}
            className={styles.input}
            defaultValue={info}
            rows={5}
          />
        )}
      </div>
    );
  }
  return (
    <div>
      <p className="bold">{title}</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>{info}</p>
    </div>
  );
}
