import styles from '@/styles/modules/radioButton.module.scss';

type inputOptions = {
  type: string;
  name: string;
  label: string;
};

type RadioButtonProps = {
  title: string;
  description?: string;
  options: inputOptions[];
};

export default function RadioButton({ title, description, options }: RadioButtonProps) {
  return (
    <div className="d-flex flex-col gap-05">
      <p className="bold">{title}</p>
      {description !== undefined ? <p className="tiny-text">{description}</p> : null}
      {options.map(option => {
        if (option.type == 'button') {
          return (
            <button
              key={option.name}
              id={option.name}
              name={option.name}
              type={option.type}
              className={`${styles.btn} btn btn-secondary`}
            >
              {option.label}
            </button>
          );
        }

        return (
          <div key={option.name} className={`${styles.option} d-flex align-items-center gap-05`}>
            <input id={option.name} name={option.name} type={option.type}></input>
            <label htmlFor={option.name} className="regular small-text">
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}
