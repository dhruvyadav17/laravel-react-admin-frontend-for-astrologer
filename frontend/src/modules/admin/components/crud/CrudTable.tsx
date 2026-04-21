
import AdminTablePage from '../AdminTablePage';
import { useAuth }    from '../../../auth/hooks/useAuth';

type Props<T extends { id: number }> = {
  entity:      string;
  items:       T[];
  isLoading:   boolean;
  isError:     boolean;
  refetch:     () => void;
  columns:     React.ReactNode;
  renderRow:   (item: T) => React.ReactNode;
  setEditing:  (item: Partial<T> | null) => void;
  permissions?: { create?: string | boolean };
  topContent?:  React.ReactNode;
};

export default function CrudTable<T extends { id: number }>({
  entity, items, isLoading, isError, refetch,
  columns, renderRow, setEditing, permissions, topContent,
}: Props<T>) {
  const { can } = useAuth();

  const canCreate =
    permissions?.create === true ||
    permissions?.create === undefined ||
    (typeof permissions?.create === 'string' && can(permissions.create));

  return (
    <AdminTablePage
      title={`${entity}s`}
      actionLabel={`Add ${entity}`}
      onAction={canCreate ? () => setEditing({} as Partial<T>) : undefined}
      loading={isLoading}
      error={isError}
      onRetry={refetch}
      empty={!isLoading && !isError && items.length === 0}
      columns={columns}
      topContent={topContent}
    >
      {!isLoading && !isError && items.map((item) => renderRow(item))}
    </AdminTablePage>
  );
}
