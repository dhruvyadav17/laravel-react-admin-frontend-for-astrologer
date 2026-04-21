type Props = {
  title: string;
  value: string | number;
  icon: string;
  color?: "info" | "success" | "warning" | "danger" | "primary";
};

export default function InfoBox({
  title,
  value,
  icon,
  color = "info",
}: Props) {
  return (
    <div className="info-box">
      <span className={`info-box-icon bg-${color}`}>
        <i className={icon} />
      </span>

      <div className="info-box-content">
        <span className="info-box-text">{title}</span>
        <span className="info-box-number">{value}</span>
      </div>
    </div>
  );
}
