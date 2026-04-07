import { useState } from "react";
import { execute } from "../../utils/feedback";

type MutationFn = (data: any) => {
  unwrap: () => Promise<any>;
};

type UseCrudOptions<T> = {
  create?: MutationFn;
  update?: MutationFn;
  remove?: MutationFn;
  onSuccess?: () => void;
};

export function useCrud<T>({
  create,
  update,
  remove,
  onSuccess,
}: UseCrudOptions<T>) {
  const [loading, setLoading] = useState(false);

  /* ───────────────── COMMON RUNNER (DRY) ───────────────── */
  const run = async (
    fn: () => Promise<any>,
    message: string,
    variant?: any
  ) => {
    try {
      setLoading(true);

      const res = await execute(fn, {
        defaultMessage: message,
        variant,
      });

      onSuccess?.();
      return res;
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── CREATE ───────────────── */
  const createItem = async (values: T) => {
    if (!create) return;
    return run(
      () => create(values).unwrap(),
      "Created successfully"
    );
  };

  /* ───────────────── UPDATE ───────────────── */
  const updateItem = async (id: number, values: T) => {
    if (!update) return;
    return run(
      () => update({ id, ...values }).unwrap(),
      "Updated successfully"
    );
  };

  /* ───────────────── DELETE ───────────────── */
  const deleteItem = async (id: number) => {
    if (!remove) return;
    return run(
      () => remove(id).unwrap(),
      "Deleted successfully",
      "danger"
    );
  };

  /* ───────────────── SUBMIT HANDLER ───────────────── */
  const handleSubmit = async (editing: any, values: T) => {
    if (editing?.id) {
      return updateItem(editing.id, values);
    }
    return createItem(values);
  };

  /* ───────────────── RETURN ───────────────── */
  return {
    loading,
    create: createItem,
    update: updateItem,
    remove: deleteItem,
    handleSubmit,
  };
}