// PATH: src/components/form/FormModal.tsx
// FIX: textarea + select field type support add kiya
//      Original mein sirf text/email/password/number tha
//      AstrologerRequest mein bio (textarea) aur consultation_type (select) hain

import { useEffect, useState } from "react";
import CrudModal  from "./CrudModal";
import FormInput  from "./FormInput";
import FormSelect from "./FormSelect";
import type { FieldConfig } from "../../types/models";

type Props<T> = {
  title:         string;
  entity?:       { id?: number } | null;
  fields:        FieldConfig<T>[];
  initialValues: T;
  onSubmit:      (values: T) => void;
  loading?:      boolean;
  onClose:       () => void;
  saveText?:     string;
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

  useEffect(() => {
    setValues(entity ? { ...initialValues, ...entity } : initialValues);
  }, [entity, initialValues]);

  const handleChange = (field: keyof T, value: any) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (loading) return;
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
      {fields.map((field) => {
        const val = values[field.name] ?? "";

        /* ── SELECT ─────────────────────────────────── */
        if (field.type === "select" && field.options) {
          return (
            <FormSelect
              key={String(field.name)}
              label={field.label}
              value={val}
              options={field.options}
              required={field.required}
              disabled={loading || !!field.disabled}
              onChange={(v) => handleChange(field.name, v)}
            />
          );
        }

        /* ── TEXTAREA ───────────────────────────────── */
        if (field.type === "textarea") {
          return (
            <div key={String(field.name)} className="mb-2">
              {field.label && (
                <label className="form-label">
                  {field.label}
                  {field.required && (
                    <span className="text-danger ms-1">*</span>
                  )}
                </label>
              )}
              <textarea
                className="form-control"
                value={val}
                rows={field.rows ?? 3}
                placeholder={field.placeholder}
                disabled={loading || !!field.disabled}
                required={field.required}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            </div>
          );
        }

        /* ── DEFAULT: text / email / number / password ── */
        return (
          <FormInput
            key={String(field.name)}
            label={field.label}
            type={field.type as "text" | "email" | "number" | "password"}
            required={field.required}
            placeholder={field.placeholder}
            value={val}
            disabled={loading || !!field.disabled}
            onChange={(v) => handleChange(field.name, v)}
          />
        );
      })}
    </CrudModal>
  );
}