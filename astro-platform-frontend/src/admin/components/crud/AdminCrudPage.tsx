import { useMemo, useState } from "react";
import AdminTablePage from "../page/AdminTablePage";
import RowActions from "../../../components/table/RowActions";
import FormModal from "../../../components/form/FormModal";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useRowActions } from "../../hooks/useRowActions";
import { useCrudActions } from "../../../hooks/useCrudActions";

type PermissionsConfig = {
  create?: string;
  delete?: string;
};

type Props<T> = {
  entity: string;

  api: {
    list: any;
    create: any;
    update?: any;
    delete?: any;
  };

  columns: React.ReactNode;
  fields: any[];
  initialValues: T;

  permissions?: PermissionsConfig;

  renderRow?: (item: T, actions: any[]) => React.ReactNode;
  topContent?: React.ReactNode;
};

export default function AdminCrudPage<T extends { id?: number }>({
  entity,
  api,
  columns,
  fields,
  initialValues,
  permissions,
  renderRow,
  topContent,
}: Props<T>) {
  const { can } = useAuth();
  const confirmAction = useConfirmAction();

  /* ================= QUERY ================= */

  const { data, isLoading, isError, refetch } = api.list();

  const items: T[] = useMemo(
    () => data?.data ?? data ?? [],
    [data]
  );

  /* ================= STATE ================= */

  const [editing, setEditing] = useState<T | null>(null);

  /* ================= MUTATIONS (SAFE) ================= */

  const createMutation = api.create ? api.create()[0] : undefined;
  const updateMutation = api.update ? api.update()[0] : undefined;
  const deleteMutation = api.delete ? api.delete()[0] : undefined;

  /* ================= CRUD ================= */

  const crud = useCrudActions<T>({
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    onSuccess: () => {
      setEditing(null);
      refetch();
    },
  });

  /* ================= SUBMIT ================= */

  const handleSubmit = (values: T) => {
    if (editing?.id) {
      crud.update(editing.id, values);
    } else {
      crud.create(values);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = (item: T) => {
    if (!deleteMutation || !item.id) return;

    confirmAction({
      message: `Are you sure you want to delete this ${entity}?`,
      confirmLabel: `Delete ${entity}`,
      onConfirm: async () => {
        await crud.remove(item.id!);
        refetch();
      },
    });
  };

  /* ================= ROW ACTIONS ================= */

  const getRowActions = (item: T) =>
    useRowActions({
      row: item,
      edit: {
        enabled: !!updateMutation,
        onClick: () => setEditing(item),
      },
      delete: {
        enabled:
          !!deleteMutation &&
          (!permissions?.delete || can(permissions.delete)),
        onClick: handleDelete,
      },
    });

  /* ================= RENDER ================= */

  return (
    <>
      <AdminTablePage
        title={`${entity}s`}
        permission={permissions?.create}
        actionLabel={`Add ${entity}`}
        onAction={() => setEditing({} as T)}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        empty={!isLoading && !isError && items.length === 0}
        columns={columns}
        topContent={topContent}
      >
        {!isLoading &&
          !isError &&
          items.map((item) =>
            renderRow ? (
              renderRow(item, getRowActions(item))
            ) : (
              <tr key={item.id}>
                <td>{JSON.stringify(item)}</td>
                <td className="text-end">
                  <RowActions actions={getRowActions(item)} />
                </td>
              </tr>
            )
          )}
      </AdminTablePage>

      {/* ================= FORM ================= */}

      {editing && (
        <FormModal
          title={editing.id ? `Edit ${entity}` : `Add ${entity}`}
          entity={editing}
          initialValues={editing.id ? editing : initialValues}
          fields={fields}
          loading={crud.loading}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}