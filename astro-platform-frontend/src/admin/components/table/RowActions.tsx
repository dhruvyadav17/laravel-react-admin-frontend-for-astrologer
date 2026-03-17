import Button from "../../../components/common/Button";

export type RowAction = {
  key: string;
  label?: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "warning" | "danger" | "success";
  show?: boolean;
  disabled?: boolean;
  icon?: string;
  title?: string;
};

type Props = {
  actions: RowAction[];
};

export default function RowActions({ actions }: Props) {
  const visible = actions.filter((a) => a.show !== false);
  if (!visible.length) return null;

  return (
    <div className="d-flex justify-content-end">
      {visible.map((action, index) => (
        <Button
          key={action.key}
          label={action.label}
          icon={action.icon}
          variant={action.variant}
          onClick={action.onClick}
          disabled={action.disabled}
          size="sm"
          title={action.title}
          className={index < visible.length - 1 ? "me-2" : ""}
        />
      ))}
    </div>
  );
}
