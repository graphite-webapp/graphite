import styles from '@/styles/modules/radioButton.module.scss';

export default function RadioButton({ title, description = null, options }) {
  return (
    <div className="d-flex flex-col gap-05">
      <p className="bold">{title}</p>
      {description ? <p className="tiny-text">{description}</p> : null}
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
