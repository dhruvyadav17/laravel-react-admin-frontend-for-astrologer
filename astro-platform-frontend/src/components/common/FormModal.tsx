import { useEffect } from "react";
import CrudModal from "./CrudModal";
import FormInput from "./FormInput";

type FieldConfig<T> = {
  name: keyof T;
  label: string;
  type?: "text" | "email" | "password" | "number";
  required?: boolean;
  placeholder?: string;
};

type Props<T> = {
  title: string;
  entity?: { id?: number } | null;

  fields: FieldConfig<T>[];

  form: {
    values: T;
    errors: any;
    loading: boolean;
    setField: (field: keyof T, value: any) => void;
    setAllValues: (values: T) => void;
    reset: () => void;
    create: () => void;
    update: (id: number) => void;
  };

  initialValues: T;
  onClose: () => void;
  saveText?: string;
};

export default function FormModal<T extends Record<string, any>>({
  title,
  entity,
  fields,
  form,
  initialValues,
  onClose,
  saveText,
}: Props<T>) {
  useEffect(() => {
    if (entity) {
      form.setAllValues({
        ...initialValues,
        ...entity,
      });
    } else {
      form.reset();
    }
  }, [entity]);

  const handleSubmit = () => {
    entity?.id
      ? form.update(entity.id)
      : form.create();
  };

  return (
    <CrudModal
      title={title}
      loading={form.loading}
      onSave={handleSubmit}
      onClose={onClose}
      saveText={saveText}
    >
      {fields.map((field) => (
        <FormInput
          key={String(field.name)}
          label={field.label}
          type={field.type}
          required={field.required}
          placeholder={field.placeholder}
          value={form.values[field.name] ?? ""}
          error={form.errors?.[field.name]?.[0]}
          onChange={(v) =>
            form.setField(field.name, v)
          }
          disabled={form.loading}
        />
      ))}
    </CrudModal>
  );
}
