import { submitFileUpload } from '@/types/importData';
import { useUser } from '@/lib/userContext';

type OptionProps = {
  label: string;
  type: 'select' | 'button' | 'edit' | 'file-upload';
  options: string[] | null;
  loading: boolean;
  classNames: string[];
  value: string | null | undefined;
};

export default function Option({
  label,
  type,
  options = null,
  loading = false,
  classNames = [''],
  value = null,
}: OptionProps) {
  const { currentUser } = useUser();

  let output;
  if (type == 'select') {
    output = (
      <div className={loading ? 'loading' : ''}>
        <p className="bold">{label}</p>

        <select className={classNames.join(' ')}>
          {!loading
            ? options?.map(option => {
                return <option key={option}>{option}</option>;
              })
            : null}
        </select>
      </div>
    );
  }

  if (type == 'button') {
    output = <button className={`btn ${classNames.join(' ')}`}>{label}</button>;
  }

  if (type == 'file-upload') {
    output = (
      <div>
        <label
          htmlFor={label.replace(' ', '-').toLocaleLowerCase()}
          className={`btn ${classNames.join(' ')}`}
        >
          {label}
        </label>
        <input
          id={label.replace(' ', '-').toLocaleLowerCase()}
          className="d-none"
          type="file"
          accept=".csv"
          onChange={e => submitFileUpload(e, currentUser?.id)}
        />
      </div>
    );
  }

  if (type == 'edit') {
    output = (
      <div
        className={`d-flex justify-content-between align-items-center ${loading ? 'loading' : ''}`}
      >
        <div>
          <p className="bold">{!loading ? label : ''}</p>
          <p>{!loading ? value : ''}</p>
        </div>
        <button className={`${loading ? 'v-hidden' : ''} btn btn-primary`}>Edit</button>
      </div>
    );
  }
  return output;
}
