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
  setting?: string;
  formName?: string;
  onChange?: (setting: string, value: string) => void;
};

export default function RadioButton({
  title,
  description,
  options,
  setting,
  formName,
  onChange,
}: RadioButtonProps) {
  const normalizedSetting = setting?.toString().replace(' ', '-');

  return (
    <div id={formName} className="d-flex flex-col gap-05">
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
              onClick={() => onChange?.(option.name)}
            >
              {option.label}
            </button>
          );
        }

        return (
          <div key={option.name} className={`${styles.option} d-flex align-items-center gap-05`}>
            <input
              id={option.name}
              name={formName}
              type={option.type}
              defaultChecked={normalizedSetting == option.name}
              onChange={() => onChange?.(formName, option.name)}
            ></input>
            <label htmlFor={option.name} className={`${styles.label} regular small-text w-fill`}>
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}
