type Props = {
  text?: string;
};

/* ================= LOADER ================= */
export function UserLoader({ text = "Loading..." }: Props) {
  return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger" />
      <p className="text-muted mt-2 mb-0">{text}</p>
    </div>
  );
}

/* ================= EMPTY ================= */
export function UserEmpty({ text = "No data found" }: Props) {
  return (
    <div className="text-center mt-5 text-muted">
      <p className="mb-0">{text}</p>
    </div>
  );
}

/* ================= ERROR ================= */
export function UserError({ text = "Something went wrong" }: Props) {
  return (
    <div className="text-center mt-5 text-danger">
      <p className="mb-0">{text}</p>
    </div>
  );
}