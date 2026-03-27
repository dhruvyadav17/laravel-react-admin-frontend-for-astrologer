import { useMemo, useState } from "react";
import AdminTablePage from "../page/AdminTablePage";
import RowActions from "../../../components/table/RowActions";
import FormModal from "../../../components/form/FormModal";
import { useConfirmAction } from "../../../hooks/useConfirmAction";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useCrudActions } from "../../../hooks/useCrudActions";
import { useRowActions } from "../../hooks/useRowActions";

/* ================= TYPES ================= */

type BaseEntity = {
  id: number;
};

type PermissionsConfig = {
  create?: string | boolean;
  delete?: string | boolean;
};

type QueryResult = {
  data?: any;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

type MutationTuple = [Function, any];

type Props<T extends BaseEntity> = {
  entity: string;

  query: QueryResult;

  mutations?: {
    create?: MutationTuple;
    update?: MutationTuple;
    delete?: MutationTuple;
  };

  columns: React.ReactNode;
  fields: any[] | ((entity: Partial<T>) => any[]);
  initialValues: T;

  permissions?: PermissionsConfig;

  renderRow?: (item: T, actions: any[]) => React.ReactNode;
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
  const { can } = useAuth();
  const confirmAction = useConfirmAction();

  /* ================= QUERY ================= */

  const { data, isLoading, isError, refetch } = query;

  const items = useMemo<T[]>(() => {
    if (Array.isArray(data)) return data as T[];
    return (data?.data ?? []) as T[];
  }, [data]);

  /* ================= STATE ================= */

  const [editing, setEditing] = useState<Partial<T> | null>(null);

  /* ================= MUTATIONS ================= */

  const createMutation = mutations?.create?.[0];
  const updateMutation = mutations?.update?.[0];
  const deleteMutation = mutations?.delete?.[0];

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
    const id = (editing as T)?.id;

    if (id) {
      crud.update(id, values);
    } else {
      crud.create(values);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = (item: T) => {
    const id = item.id;

    if (!deleteMutation || !id) return;

    confirmAction({
      message: `Are you sure you want to delete this ${entity}?`,
      confirmLabel: `Delete ${entity}`,
      onConfirm: async () => {
        await crud.remove(id);
        refetch();
      },
    });
  };

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
          items.map((item: T) => {
            const actions = useRowActions({
              row: item,
              edit: {
                enabled: !!updateMutation,
                onClick: () => setEditing(item),
              },
              delete: {
                enabled:
                  !!deleteMutation &&
                  permissions?.delete !== false &&
                  (typeof permissions?.delete === "string"
                    ? can(permissions.delete)
                    : true),
                onClick: handleDelete,
              },
              extra: extraActions.map((a) => ({
                ...a,
                onClick: () => a.onClick(item),
              })),
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

      {/* ================= FORM ================= */}

      {editing && (
        <FormModal
          title={(editing as T)?.id ? `Edit ${entity}` : `Add ${entity}`}
          entity={editing}
          initialValues={(editing as T)?.id ? (editing as T) : initialValues}
          fields={typeof fields === "function" ? fields(editing) : fields}
          loading={crud.loading}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}