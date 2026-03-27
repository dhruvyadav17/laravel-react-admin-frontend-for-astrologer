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
  restoreHandler, // ✅ NEW (clean restore)
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
        items.map((item: any) => {
          const isDeleted = !!item.deleted_at;

          const actions = useRowActions({
            row: item,
            isDeleted,

            /* ================= EDIT ================= */
            edit: {
              enabled: !isDeleted,
              onClick: () => setEditing(item),
            },

            /* ================= DELETE ================= */
            delete: {
              enabled:
                !isDeleted &&
                !!deleteMutation &&
                permissions?.delete !== false &&
                (typeof permissions?.delete === "string"
                  ? can(permissions.delete)
                  : true),

              onClick: (row: any) => handleDelete(row),
            },

            /* ================= RESTORE ================= */
            restore: {
              enabled: isDeleted,
              onClick: (row: any) => {
                console.log("RESTORE CLICK", row); // 👈 add this
                restoreHandler?.(row);
              },
            },

            /* ================= EXTRA ================= */
            extra: extraActions,
          });

          return renderRow ? (
            renderRow(item, actions)
          ) : (
            <tr key={item.id}>
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
