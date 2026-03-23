import { useEffect, useState } from "react";
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

  initialValues: T;
  onSubmit: (values: T) => void;

  loading?: boolean;
  onClose: () => void;
  saveText?: string;
};

export default function FormModal<T extends Record<string, any>>({
  title,
  entity,
  fields,
  initialValues,
  onSubmit,
  loading = false,
  onClose,
  saveText,
}: Props<T>) {
  const [values, setValues] = useState<T>(initialValues);

  /* 🔥 sync edit/create */
  useEffect(() => {
    setValues(entity ? { ...initialValues, ...entity } : initialValues);
  }, [entity, initialValues]);

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (loading) return; // 🔥 prevent double submit
    onSubmit(values);
  };

  return (
    <CrudModal
      title={title}
      loading={loading}
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
          value={values[field.name] ?? ""}
          onChange={(v) => handleChange(field.name, v)}
          disabled={loading}
        />
      ))}
    </CrudModal>
  );
}