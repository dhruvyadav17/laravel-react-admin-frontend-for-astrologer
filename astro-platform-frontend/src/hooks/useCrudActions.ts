import { useState } from "react";
import { execute } from "../utils/feedback";

type MutationFn = (data: any) => {
  unwrap: () => Promise<any>;
};

type Options<T> = {
  create?: MutationFn;
  update?: MutationFn;
  remove?: MutationFn;
  onSuccess?: () => void;
};

export function useCrudActions<T>({
  create,
  update,
  remove,
  onSuccess,
}: Options<T>) {
  const [loading, setLoading] = useState(false);

  const handleCreate = async (values: T) => {
    if (!create) return;

    try {
      setLoading(true);

      await execute(
        () => create(values).unwrap(),
        { defaultMessage: "Created successfully" }
      );

      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, values: T) => {
    if (!update) return;

    try {
      setLoading(true);

      await execute(
        () => update({ id, ...values }).unwrap(),
        { defaultMessage: "Updated successfully" }
      );

      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!remove) return;

    return execute(
      () => remove(id).unwrap(),
      {
        defaultMessage: "Deleted successfully",
        variant: "danger",
      }
    );
  };

  return {
    loading,
    create: handleCreate,
    update: handleUpdate,
    remove: handleDelete,
  };
}