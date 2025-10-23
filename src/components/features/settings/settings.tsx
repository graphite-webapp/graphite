import Option from '../../ui/option';

export default function Settings() {
  return (
    <section className="info-block d-flex flex-col gap-1">
      <h5>Appearance</h5>
      <Option
        label="Theme"
        type="select"
        options={['System default', 'Light', 'Dark']}
        classNames={[]}
        value={''}
      />

      <h5>App settings</h5>
      <Option
        label="Calculate stats"
        type="select"
        options={['per session', 'per day']}
        classNames={[]}
        value={''}
      />
      <Option
        label="Import data"
        type="file-upload"
        options={[]}
        classNames={['btn-secondary']}
        value={''}
      />
      <Option
        label="Export data"
        type="button"
        options={[]}
        classNames={['btn-secondary']}
        value={''}
      />
    </section>
  );
}
