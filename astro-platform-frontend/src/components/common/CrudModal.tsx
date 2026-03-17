import Modal from "./Modal";

type Props = {
  title: string;
  loading?: boolean;
  onSave: () => void | Promise<void>;
  onClose: () => void;
  saveText?: string;
  saveVariant?: "primary" | "success" | "danger";
  children: React.ReactNode;
};

export default function CrudModal({
  title,
  loading = false,
  onSave,
  onClose,
  saveText,
  saveVariant = "primary",
  children,
}: Props) {
  const computedSaveText = loading
    ? "Saving..."
    : saveText ??
      (title.toLowerCase().includes("edit") ||
      title.toLowerCase().includes("update")
        ? "Update"
        : "Save");

  return (
    <Modal
      title={title}
      onClose={onClose}
      onSave={onSave}
      saveVariant={saveVariant}
      saveDisabled={loading}
      saveText={computedSaveText}
    >
      {children}
    </Modal>
  );
}
