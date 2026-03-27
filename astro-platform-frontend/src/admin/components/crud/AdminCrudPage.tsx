import { useMemo, useState } from "react";
import { useConfirmAction } from "../../../hooks/useConfirmAction";

import CrudTable from "./CrudTable";
import CrudFormModal from "./CrudFormModal";
import { useCrudController } from "./useCrudController";

/* ================= TYPES ================= */

type BaseEntity = {
  id: number;
};

type Props<T extends BaseEntity> = {
  entity: string;
  query: any;
  mutations?: any;
  columns: React.ReactNode;
  fields: any;
  initialValues: T;
  permissions?: any;
  renderRow?: any;
  topContent?: React.ReactNode;
  extraActions?: any[];
};

export default function AdminCrudPage<T extends BaseEntity>({
  entity,
  query,
  mutations,
  columns,
  fields,
  initialValues,
  permissions,
  renderRow,
  topContent,
  extraActions = [],
}: Props<T>) {
  const confirmAction = useConfirmAction();

  const { data, isLoading, isError, refetch } = query;

  const items = useMemo<T[]>(() => {
    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  }, [data]);

  const [editing, setEditing] = useState<Partial<T> | null>(null);

  const createMutation = mutations?.create?.[0];
  const updateMutation = mutations?.update?.[0];
  const deleteMutation = mutations?.delete?.[0];

  const crud = useCrudController<T>({
    createMutation,
    updateMutation,
    deleteMutation,
    onSuccess: () => {
      setEditing(null);
      refetch();
    },
  });

  const handleDelete = (item: T) => {
    confirmAction({
      message: `Are you sure you want to delete this ${entity}?`,
      confirmLabel: `Delete ${entity}`,
      onConfirm: async () => {
        await crud.handleDelete(item.id);
        refetch();
      },
    });
  };

  return (
    <>
      <CrudTable
        entity={entity}
        items={items}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        columns={columns}
        renderRow={renderRow}
        setEditing={setEditing}
        deleteMutation={deleteMutation}
        handleDelete={handleDelete}
        permissions={permissions}
        extraActions={extraActions}
        topContent={topContent}
      />

      <CrudFormModal
        entity={entity}
        editing={editing}
        initialValues={initialValues}
        fields={fields}
        loading={crud.loading}
        onSubmit={crud.handleSubmit}
        onClose={() => setEditing(null)}
      />
    </>
  );
}