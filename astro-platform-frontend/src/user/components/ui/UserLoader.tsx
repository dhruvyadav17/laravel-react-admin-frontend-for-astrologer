export function UserLoader({ text = "Loading..." }) {
  return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger" />
      <p className="text-muted mt-2">{text}</p>
    </div>
  );
}