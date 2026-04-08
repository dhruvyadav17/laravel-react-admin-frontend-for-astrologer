import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import CrudTable from "./CrudTable";
import CrudFormModal from "./CrudFormModal";
import type { FieldConfig } from "../../../types/models";

/* ================= TYPES ================= */

type BaseEntity = { id: number; deleted_at?: string | null };

export type QueryResult<T> = {
  data: T[] | { data: T[] };
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export type MutationFn<T = unknown> = (arg: T) => Promise<any>;

export type CrudMutations<T extends BaseEntity> = {
  create?: [MutationFn<Partial<T>>];
  update?: [MutationFn<{ id: number } & Partial<T>>];
  delete?: [MutationFn<number>];
  restore?: [MutationFn<number>];
};

export type CrudPermissions = {
  create?: string | boolean;
  update?: string | boolean;
  delete?: string | boolean;
  restore?: string | boolean;
};

type Props<T extends BaseEntity> = {
  entity: string;
  query: QueryResult<T>;
  mutations?: CrudMutations<T>;
  columns: React.ReactNode;
  fields: FieldConfig<Partial<T>>[];
  initialValues: Partial<T>;
  permissions?: CrudPermissions;
  renderRow?: (item: T, actions: any[]) => React.ReactNode;
  topContent?: React.ReactNode;

  /* ✅ supports function + array */
  extraActions?: ((item: T) => any[]) | any[];
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
  extraActions,
}: Props<T>) {
  const confirmAction = useConfirmAction();
  const { data, isLoading, isError, refetch } = query;

  /* ✅ normalize data */
  const items = useMemo<T[]>(() => {
    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  }, [data]);

  const [editing, setEditing] = useState<Partial<T> | null>(null);

  /* ── Mutations ───────────────────────── */
  const createMutation = mutations?.create?.[0];
  const updateMutation = mutations?.update?.[0];
  const deleteMutation = mutations?.delete?.[0];
  const restoreMutation = mutations?.restore?.[0];

  /* ── Handlers ───────────────────────── */

  const handleSubmit = async (editing: any, values: Partial<T>) => {
    try {
      if (editing?.id) {
        await updateMutation?.({ id: editing.id, ...values });
      } else {
        await createMutation?.(values);
      }

      setEditing(null);
      refetch();
    } catch {
      toast.error(`Failed to save ${entity}`);
    }
  };

  const handleDelete = (item: T) => {
    if (!deleteMutation) return;

    confirmAction({
      message: `Are you sure you want to delete this ${entity}?`,
      confirmLabel: `Delete ${entity}`,
      onConfirm: async () => {
        try {
          await deleteMutation(item.id);
          refetch();
        } catch {
          toast.error(`Failed to delete ${entity}`);
        }
      },
    });
  };

  const handleRestore = async (item: T) => {
    if (!restoreMutation) return;

    try {
      await restoreMutation(item.id);
      refetch();
    } catch {
      toast.error(`Failed to restore ${entity}`);
    }
  };

  /* ── Row Actions ───────────────────── */

  const getActions = (item: T) => {
    let actions: any[] = [];

    /* ✅ SAFE extraActions handling */
    if (typeof extraActions === "function") {
      const result = extraActions(item);
      if (Array.isArray(result)) {
        actions = [...result];
      }
    } else if (Array.isArray(extraActions)) {
      actions = [...extraActions];
    }

    /* default actions */
    if (!item.deleted_at) {
      actions.push(
        {
          key: "edit",
          icon: "fas fa-edit",
          variant: "primary",
          onClick: () => setEditing(item),
        },
        {
          key: "delete",
          icon: "fas fa-trash",
          variant: "danger",
          onClick: () => handleDelete(item),
        },
      );
    } else {
      actions.push({
        key: "restore",
        icon: "fas fa-undo",
        variant: "success",
        onClick: () => handleRestore(item),
      });
    }

    return actions;
  };

  /* ── Render ───────────────────────── */

  return (
    <>
      <CrudTable
        entity={entity}
        items={items}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        columns={columns}
        renderRow={(item) =>
          renderRow ? renderRow(item, getActions(item)) : null
        }
        setEditing={setEditing}
        permissions={permissions}
        topContent={topContent}
      />

      <CrudFormModal<T>
        entity={entity}
        editing={editing}
        initialValues={initialValues}
        fields={fields}
        loading={false}
        onSubmit={handleSubmit}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
