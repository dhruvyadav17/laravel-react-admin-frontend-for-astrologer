import FormModal from "../../../../components/form/FormModal";

export default function CrudFormModal<T>({
  entity,
  editing,
  initialValues,
  fields,
  loading,
  onSubmit,
  onClose,
}: any) {
  if (!editing) return null;

  return (
    <FormModal
      title={editing?.id ? `Edit ${entity}` : `Add ${entity}`}
      entity={editing}
      initialValues={editing?.id ? editing : initialValues}
      fields={typeof fields === "function" ? fields(editing) : fields}
      loading={loading}
      onSubmit={(values: T) => onSubmit(editing, values)}
      onClose={onClose}
    />
  );
}