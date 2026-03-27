export function UserEmpty({ text = "No data found" }) {
  return (
    <div className="text-center mt-5 text-muted">
      {text}
    </div>
  );
}