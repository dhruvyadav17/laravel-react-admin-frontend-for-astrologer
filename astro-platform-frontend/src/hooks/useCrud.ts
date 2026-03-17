import { useState } from "react";
import { execute } from "../utils/feedback";

type Options<T> = {
  create?: any;
  update?: any;
  remove?: any;
  onSuccess?: () => void;
};

export function useCrud<T>({
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

  const handleUpdate = async (
    id: number,
    values: T
  ) => {
    if (!update) return;

    try {
      setLoading(true);

      await execute(
        () =>
          update({ id, ...values }).unwrap(),
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
