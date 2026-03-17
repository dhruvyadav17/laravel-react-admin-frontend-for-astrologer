import AdminPage from "./AdminPage";
import AdminCard from "../ui/AdminCard";
import DataTable from "../table/DataTable";

type Props = {
  title: string;
  permission?: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;

  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyText?: string;

  columns: React.ReactNode;
  children: React.ReactNode;

  /** optional extra content (search etc.) */
  topContent?: React.ReactNode;
};

export default function AdminTablePage({
  title,
  permission,
  actionLabel,
  actionIcon,
  onAction,
  loading = false,
  empty = false,
  error = false,
  onRetry,
  emptyText = "No data available",
  columns,
  children,
  topContent,
}: Props) {
  return (
    <AdminPage
      title={title}
      permission={permission}
      actionLabel={actionLabel}
      actionIcon={actionIcon}
      onAction={onAction}
    >
      {topContent}

      <AdminCard
        title={`${title} List`}
        loading={loading}
        empty={empty}
        error={error}
        onRetry={onRetry}
        emptyText={emptyText}
      >
        <DataTable columns={columns}>
          {children}
        </DataTable>
      </AdminCard>
    </AdminPage>
  );
}
