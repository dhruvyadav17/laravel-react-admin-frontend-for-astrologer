// Reusable round call control button used in both user and astrologer call pages.
type Props = {
  onClick: () => void;
  icon:    string; // FontAwesome class e.g. "fa-microphone"
  danger?: boolean;  // always red (hang up)
  active?: boolean;  // currently toggled on (muted / cam off)
};

export default function CallBtn({ onClick, icon, danger, active }: Props) {
  return (
    <button
      className={`btn rounded-circle d-flex align-items-center justify-content-center ${
        danger ? 'btn-danger' : active ? 'btn-danger' : 'btn-outline-secondary'
      }`}
      style={{ width: 56, height: 56 }}
      onClick={onClick}
    >
      <i className={`fas ${icon} fs-5`} />
    </button>
  );
}
