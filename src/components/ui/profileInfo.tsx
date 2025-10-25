export default function ProfileInfo({ title, info }) {
  return (
    <div>
      <p className="bold">{title}</p>
      <p>{info}</p>
    </div>
  );
}
