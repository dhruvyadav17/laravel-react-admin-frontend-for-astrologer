import { useMemo, useState } from "react";
import AdminTablePage from "../page/AdminTablePage";
import RowActions from "../table/RowActions";
import FormModal from "../../../components/common/FormModal";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useRowActions } from "../../hooks/useRowActions";
import { useCrudForm } from "../../../hooks/useCrudForm";

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

  const { data, isLoading, isError, refetch } =
    queryHook();

  const items: T[] = useMemo(
    () =>
      transformData
        ? transformData(data)
        : data ?? [],
    [data]
  );

  const [editing, setEditing] =
    useState<T | null>(null);

  const [createMutation] = createHook();
  const [updateMutation] = updateHook
    ? updateHook()
    : [null];
  const [deleteMutation] = deleteHook
    ? deleteHook()
    : [null];

  const form = useCrudForm({
    initialValues,
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    onSuccess: () => setEditing(null),
  });

  const handleDelete = (item: T) => {
    if (!deleteMutation) return;

    confirmAction({
      message: `Are you sure you want to delete this ${entity}?`,
      confirmLabel: `Delete ${entity}`,
      onConfirm: async () => {
        await form.remove(item.id);
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
          (!permissions?.delete ||
            can(permissions.delete)),
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
        empty={
          !isLoading &&
          !isError &&
          items.length === 0
        }
        columns={columns}
      >
        {!isLoading &&
          !isError &&
          items.map((item) => (
            <tr key={item.id}>
              {Object.keys(item)
                .filter((k) => k !== "id")
                .map((key) => (
                  <td key={key}>
                    {(item as any)[key]}
                  </td>
                ))}
              <td className="text-end">
                <RowActions
                  actions={getRowActions(item)}
                />
              </td>
            </tr>
          ))}
      </AdminTablePage>

      {editing && (
        <FormModal
          title={entity}
          entity={editing}
          initialValues={initialValues}
          form={form}
          fields={fields}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
