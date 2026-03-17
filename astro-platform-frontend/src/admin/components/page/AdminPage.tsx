import { Card, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/common/Button";
import Can from "../../../components/common/Can";

type Props = {
  title: string;
  permission?: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
  children: React.ReactNode;
};

export default function AdminPage({
  title,
  permission,
  actionLabel,
  actionIcon,
  onAction,
  children,
}: Props) {
  const action =
    permission && actionLabel && onAction ? (
      <Can permission={permission}>
        <Button
          label={actionLabel}
          icon={actionIcon}
          onClick={onAction}
        />
      </Can>
    ) : null;

  return (
    <section className="content pt-3">
      <div className="container-fluid">
        {/* HEADER */}
        <Card className="mb-3">
          <CardHeader title={title} action={action} />
        </Card>

        {/* CONTENT */}
        {children}
      </div>
    </section>
  );
}
