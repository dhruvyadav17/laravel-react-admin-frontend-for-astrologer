// PATH: src/admin/components/crud/CrudTable.tsx
// FIX 1: useRowActions() ko .map() ke ANDAR se bahar nikala — React Hook Rules violation tha
//         Hooks conditionally ya loop ke andar call nahi ho sakte
// FIX 2: console.log("RESTORE CLICK") debug code hata diya

import AdminTablePage from "../page/AdminTablePage";
import RowActions from "../../../components/table/RowActions";
import { useAuth } from "../../../auth/hooks/useAuth";
import { ICONS } from "../../../constants/ui";

/* ─── Build actions outside of hook — pure function ─── */
function buildRowActions({
  item,
  isDeleted,
  deleteMutation,
  permissions,
  can,
  setEditing,
  handleDelete,
  restoreHandler,
  extraActions,
}: {
  item:           any;
  isDeleted:      boolean;
  deleteMutation: any;
  permissions:    any;
  can:            (p: string) => boolean;
  setEditing:     (item: any) => void;
  handleDelete:   (item: any) => void;
  restoreHandler: ((item: any) => void) | undefined;
  extraActions:   any[];
}) {
  const actions: any[] = [];

  /* EDIT */
  if (!isDeleted) {
    actions.push({
      key:   "edit",
      icon:  ICONS.EDIT,
      title: "Edit",
      onClick: () => setEditing(item),
    });
  }

  /* RESTORE / DELETE */
  if (isDeleted) {
    actions.push({
      key:     "restore",
      icon:    ICONS.RESTORE,
      title:   "Restore",
      variant: "success",
      onClick: () => restoreHandler?.(item),
    });
  } else if (
    !!deleteMutation &&
    permissions?.delete !== false &&
    (typeof permissions?.delete === "string"
      ? can(permissions.delete)
      : true)
  ) {
    actions.push({
      key:     "delete",
      icon:    ICONS.DELETE,
      title:   "Archive",
      variant: "danger",
      onClick: () => handleDelete(item),
    });
  }

  /* EXTRA */
  if (!isDeleted && extraActions.length) {
    extraActions.forEach((extra) => {
      if (extra.show !== false) {
        actions.push({ ...extra, onClick: () => extra.onClick(item) });
      }
    });
  }

  return actions;
}

/* ─── CrudTable component ─── */
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
  restoreHandler,
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

          /* ✅ Pure function — NOT a hook — safe inside .map() */
          const actions = buildRowActions({
            item,
            isDeleted,
            deleteMutation,
            permissions,
            can,
            setEditing,
            handleDelete,
            restoreHandler,
            extraActions,
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