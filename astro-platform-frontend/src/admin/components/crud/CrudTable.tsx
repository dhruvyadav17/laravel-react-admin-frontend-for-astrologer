import AdminTablePage from "../page/AdminTablePage";
import RowActions from "../../../components/table/RowActions";
import { useRowActions } from "../../hooks/useRowActions";
import { useAuth } from "../../../auth/hooks/useAuth";

export default function CrudTable<T>({
  entity,
  items,
  isLoading,
  isError,
  refetch,
  columns,
  renderRow,
  setEditing,
  deleteMutation,
  handleDelete,
  permissions,
  extraActions = [],
  topContent,
}: any) {
  const { can } = useAuth();

  return (
    <AdminTablePage
      title={`${entity}s`}
      permission={permissions?.create}
      actionLabel={`Add ${entity}`}
      onAction={() => setEditing({})}
      loading={isLoading}
      error={isError}
      onRetry={refetch}
      empty={!isLoading && !isError && items.length === 0}
      columns={columns}
      topContent={topContent}
    >
      {!isLoading &&
        !isError &&
        items.map((item: T) => {
          const actions = useRowActions({
            row: item,
            edit: {
              enabled: true,
              onClick: () => setEditing(item),
            },
            delete: {
              enabled:
                !!deleteMutation &&
                permissions?.delete !== false &&
                (typeof permissions?.delete === "string"
                  ? can(permissions.delete)
                  : true),
              onClick: (row: any) => handleDelete(row.id),
            },
            extra: extraActions.map((a: any) => ({
              ...a,
              onClick: () => a.onClick(item),
            })),
          });

          return renderRow ? (
            renderRow(item, actions)
          ) : (
            <tr key={(item as any).id}>
              <td>{JSON.stringify(item)}</td>
              <td className="text-end">
                <RowActions actions={actions} />
              </td>
            </tr>
          );
        })}
    </AdminTablePage>
  );
}