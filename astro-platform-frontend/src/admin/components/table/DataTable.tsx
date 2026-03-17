type Props = {
  columns: React.ReactNode;
  children?: React.ReactNode;
};

export default function DataTable({
  columns,
  children,
}: Props) {
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>{columns}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
