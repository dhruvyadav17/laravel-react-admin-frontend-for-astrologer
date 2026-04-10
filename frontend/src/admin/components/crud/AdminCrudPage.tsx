// PATH: src/admin/components/crud/AdminCrudPage.tsx
// FIX F8: CRITICAL — CrudTable ko actions nahi milte the
//   AdminCrudPage ke getActions() the lekin CrudTable ko pass nahi hote the
//   CrudTable ko deleteMutation=undefined milta tha → koi bhi button nahi dikhta tha
// FIX: AdminCrudPage actions build karke renderRow ke through pass karta hai
//   CrudTable sirf display karta hai (Single Responsibility)

import { useMemo, useState, useCallback } from 'react';
import { toast }                           from 'react-toastify';
import { useConfirmAction }                from '../../../hooks/useConfirmAction';
import CrudTable                           from './CrudTable';
import CrudFormModal                       from './CrudFormModal';
import type { FieldConfig }                from '../../../types/models';

type BaseEntity = { id: number; deleted_at?: string | null };

type RTKMutationFn<TArg = any> = (arg: TArg) => { unwrap: () => Promise<any> };

export type CrudMutations<T extends BaseEntity> = {
  create?:  RTKMutationFn<Partial<T>>;
  update?:  RTKMutationFn<{ id: number } & Partial<T>>;
  delete?:  RTKMutationFn<number>;
  restore?: RTKMutationFn<number>;
};

export type CrudPermissions = {
  create?:  string | boolean;
  update?:  string | boolean;
  delete?:  string | boolean;
  restore?: string | boolean;
};

export type RowAction = {
  key:      string;
  icon:     string;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'secondary';
  label?:   string;
  title?:   string;
  show?:    boolean;
  onClick:  () => void;
};

export type QueryResult<T> = {
  data:      T[] | { data: T[] } | undefined;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
};

type Props<T extends BaseEntity> = {
  entity:        string;
  query:         QueryResult<T>;
  mutations?:    CrudMutations<T>;
  columns:       React.ReactNode;
  fields:        FieldConfig<Partial<T>>[] | ((entity: Partial<T> | null) => FieldConfig<Partial<T>>[]);
  initialValues: Partial<T>;
  permissions?:  CrudPermissions;
  renderRow?:    (item: T, actions: RowAction[]) => React.ReactNode;
  topContent?:   React.ReactNode;
  extraActions?: ((item: T) => RowAction[]) | RowAction[];
  messages?: { created?: string; updated?: string; removed?: string };
};

export default function AdminCrudPage<T extends BaseEntity>({
  entity, query, mutations, columns, fields, initialValues,
  permissions, renderRow, topContent, extraActions, messages,
}: Props<T>) {
  const confirmAction = useConfirmAction();
  const { data, isLoading, isError, refetch } = query;

  const items = useMemo<T[]>(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return (data as { data: T[] })?.data ?? [];
  }, [data]);

  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [saving,  setSaving]  = useState(false);

  const run = useCallback(async (fn: () => Promise<any>, successMsg: string) => {
    setSaving(true);
    try {
      await fn();
      toast.success(successMsg);
      refetch();
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.message ?? 'Operation failed');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [refetch]);

  const handleCreate  = useCallback((values: Partial<T>) => {
    if (!mutations?.create) return;
    return run(() => mutations.create!(values).unwrap(), messages?.created ?? `${entity} created`);
  }, [mutations, run, entity, messages]);

  const handleUpdate  = useCallback((id: number, values: Partial<T>) => {
    if (!mutations?.update) return;
    return run(() => mutations.update!({ id, ...values } as any).unwrap(), messages?.updated ?? `${entity} updated`);
  }, [mutations, run, entity, messages]);

  const handleDelete  = useCallback((item: T) => {
    if (!mutations?.delete) return;
    confirmAction({
      message: `Are you sure you want to delete this ${entity}?`,
      confirmLabel: `Delete ${entity}`,
      onConfirm: async () => {
        await run(() => mutations.delete!(item.id).unwrap(), messages?.removed ?? `${entity} deleted`);
      },
    });
  }, [mutations, run, entity, messages, confirmAction]);

  const handleRestore = useCallback(async (item: T) => {
    if (!mutations?.restore) return;
    return run(() => mutations.restore!(item.id).unwrap(), `${entity} restored`);
  }, [mutations, run, entity]);

  const handleSubmit  = useCallback((editingItem: Partial<T> | null, values: Partial<T>) => {
    if (editingItem?.id) return handleUpdate(editingItem.id, values);
    return handleCreate(values);
  }, [handleCreate, handleUpdate]);

  // FIX F8: Actions built here, passed via renderRow
  const getActions = useCallback((item: T): RowAction[] => {
    const actions: RowAction[] = [];

    if (typeof extraActions === 'function') {
      actions.push(...(extraActions(item) ?? []));
    } else if (Array.isArray(extraActions)) {
      actions.push(...extraActions);
    }

    if (!item.deleted_at) {
      if (mutations?.update !== undefined) {
        actions.push({
          key: 'edit', icon: 'fas fa-edit', variant: 'primary',
          title: `Edit ${entity}`, onClick: () => setEditing(item),
        });
      }
      if (mutations?.delete !== undefined) {
        actions.push({
          key: 'delete', icon: 'fas fa-trash', variant: 'danger',
          title: `Delete ${entity}`, onClick: () => handleDelete(item),
        });
      }
    } else if (mutations?.restore !== undefined) {
      actions.push({
        key: 'restore', icon: 'fas fa-undo', variant: 'success',
        title: `Restore ${entity}`, onClick: () => handleRestore(item),
      });
    }

    return actions;
  }, [mutations, extraActions, entity, handleDelete, handleRestore]);

  const resolvedFields = typeof fields === 'function' ? fields(editing) : fields;

  return (
    <>
      <CrudTable
        entity={entity}
        items={items}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        columns={columns}
        topContent={topContent}
        permissions={permissions}
        setEditing={setEditing}
        renderRow={(item: T) => renderRow ? renderRow(item, getActions(item)) : null}
      />

      <CrudFormModal<T>
        entity={entity}
        editing={editing}
        initialValues={initialValues}
        fields={resolvedFields}
        loading={saving}
        onSubmit={handleSubmit}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
