import { useCrudActions } from "../../../hooks/useCrudActions";

export function useCrudController<T>({
  createMutation,
  updateMutation,
  deleteMutation,
  onSuccess,
}: {
  createMutation?: Function;
  updateMutation?: Function;
  deleteMutation?: Function;
  onSuccess: () => void;
}) {
  const crud = useCrudActions<T>({
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    onSuccess,
  });

  const handleSubmit = (editing: any, values: T) => {
    if (editing?.id) {
      crud.update(editing.id, values);
    } else {
      crud.create(values);
    }
  };

  const handleDelete = async (id: number) => {
    if (!deleteMutation || !id) return;
    await crud.remove(id);
  };

  return {
    ...crud,
    handleSubmit,
    handleDelete,
  };
}