import Button from '../ui/Button';

export type RowAction = {
  key: string;
  label?: string;
  onClick: (row?: any) => void;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'success' | 'info';
  show?: boolean;
  disabled?: boolean;
  icon?: string;
  title?: string;
};

type Props = {
  actions: RowAction[];
  row?: any;
};

export default function RowActions({ actions, row }: Props) {
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
          onClick={() => action.onClick(row)}
          disabled={action.disabled}
          size="sm"
          title={action.title}
          className={index < visible.length - 1 ? 'me-2' : ''}
        />
      ))}
    </div>
  );
}
