import { useMemo, useState } from "react";
import AdminTablePage from "../layout/AdminTablePage";
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
  queryHook: any;
  createHook: any;
  updateHook?: any;
  deleteHook?: any;
  columns: React.ReactNode;
  fields: any[];
  initialValues: T;
  permissions?: PermissionsConfig;
  transformData?: (data: any) => T[];
};

export default function AdminCrudPage<T extends { id?: number }>({
  entity,
  queryHook,
  createHook,
  updateHook,
  deleteHook,
  columns,
  fields,
  initialValues,
  permissions,
  transformData,
}: Props<T>) {
  const { can } = useAuth();
  const confirmAction = useConfirmAction();

  const { data, isLoading, isError, refetch } = queryHook();

  const items: T[] = useMemo(
    () => (transformData ? transformData(data) : data ?? []),
    [data]
  );

  const [editing, setEditing] = useState<T | null>(null);

  // 🔥 RTK hooks
  const [createMutation] = createHook();
  const [updateMutation] = updateHook ? updateHook() : [null];
  const [deleteMutation] = deleteHook ? deleteHook() : [null];

  // ✅ SINGLE SOURCE OF TRUTH
  const crud = useCrudActions<T>({
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    onSuccess: () => {
      setEditing(null);
      refetch();
    },
  });

  // ✅ FORM SUBMIT
  const handleSubmit = (values: T) => {
    if (editing?.id) {
      crud.update(editing.id, values);
    } else {
      crud.create(values);
    }
  };

  // ✅ DELETE
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
      >
        {!isLoading &&
          !isError &&
          items.map((item) => (
            <tr key={item.id}>
              {Object.keys(item)
                .filter((k) => k !== "id")
                .map((key) => (
                  <td key={key}>{(item as any)[key]}</td>
                ))}
              <td className="text-end">
                <RowActions actions={getRowActions(item)} />
              </td>
            </tr>
          ))}
      </AdminTablePage>

      {editing && (
        <FormModal
          title={entity}
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