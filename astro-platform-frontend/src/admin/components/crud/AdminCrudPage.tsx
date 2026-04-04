// PATH: src/admin/components/crud/AdminCrudPage.tsx
// FIX: Props mein `any` types the — proper TypeScript generics se replace kiya
//      query, mutations, fields, permissions — sab type-safe ab
// IMPROVEMENT: handleRestore mein toast feedback add kiya (success/error)

import { useMemo, useState }  from "react";
import { toast }              from "react-toastify";
import { useConfirmAction }   from "../../../hooks/useConfirmAction";
import CrudTable              from "./CrudTable";
import CrudFormModal          from "./CrudFormModal";
import { useCrudController }  from "./useCrudController";
import type { FieldConfig }   from "../../../types/models";

/* ================= TYPES ================= */

type BaseEntity = { id: number; deleted_at?: string | null };

export type QueryResult<T> = {
  data:      T[] | { data: T[] };
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
};

export type MutationFn<T = unknown> = (arg: T) => Promise<void>;

export type CrudMutations<T extends BaseEntity> = {
  create?:  [MutationFn<Partial<T>>];
  update?:  [MutationFn<Partial<T> & { id: number }>];
  delete?:  [MutationFn<number>];
  restore?: [MutationFn<number>];
};

export type CrudPermissions = {
  create?:  string | boolean;
  update?:  string | boolean;
  delete?:  string | boolean;
  restore?: string | boolean;
};

type Props<T extends BaseEntity> = {
  entity:        string;
  query:         QueryResult<T>;
  mutations?:    CrudMutations<T>;
  columns:       React.ReactNode;
  fields:        FieldConfig<Partial<T>>[];
  initialValues: Partial<T>;
  permissions?:  CrudPermissions;
  renderRow?:    (item: T, actions: any[]) => React.ReactNode;
  topContent?:   React.ReactNode;
  extraActions?: any[];
};

/* ================= COMPONENT ================= */

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
    if (Array.isArray(data)) return data as T[];
    return (data as { data: T[] })?.data ?? [];
  }, [data]);

  const [editing, setEditing] = useState<Partial<T> | null>(null);

  /* ── Mutations ────────────────────────────────── */
  const createMutation  = mutations?.create?.[0];
  const updateMutation  = mutations?.update?.[0];
  const deleteMutation  = mutations?.delete?.[0];
  const restoreMutation = mutations?.restore?.[0];

  /* ── CRUD controller ──────────────────────────── */
  const crud = useCrudController<T>({
    createMutation,
    updateMutation,
    deleteMutation,
    onSuccess: () => {
      setEditing(null);
      refetch();
    },
  });

  /* ── Delete (confirm dialog) ──────────────────── */
  const handleDelete = (item: T) => {
    confirmAction({
      message:      `Are you sure you want to archive this ${entity}?`,
      confirmLabel: `Archive ${entity}`,
      onConfirm: async () => {
        await crud.handleDelete(item.id);
        refetch();
      },
    });
  };

  /* ── Restore ──────────────────────────────────── */
  // IMPROVEMENT: toast feedback add kiya (pehle silent tha)
  const handleRestore = async (item: T) => {
    if (!restoreMutation) return;
    try {
      await restoreMutation(item.id);
      toast.success(`${entity} restored successfully`);
      refetch();
    } catch {
      toast.error(`Failed to restore ${entity}`);
    }
  };

  /* ── Render ───────────────────────────────────── */
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
        restoreHandler={handleRestore}
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
