// PATH: src/components/ui/Avatar.tsx
// NEW: Shared component — profile image ya initials
// Replaces 8-line repeated block in 5+ files

type Props = {
  name?:      string | null;
  src?:       string | null;
  size?:      number;
  color?:     string;
  className?: string;
};

export default function Avatar({ name, src, size = 32, color = "primary", className = "" }: Props) {
  const initials = name?.trim() ? name.trim().slice(0, 2).toUpperCase() : "?";
  const style    = { width: size, height: size, fontSize: Math.round(size * 0.38), flexShrink: 0 as const };

  if (src) {
    return (
      <img src={src} alt={name ?? "avatar"}
        className={`rounded-circle ${className}`}
        style={{ ...style, objectFit: "cover" }} />
    );
  }

  return (
    <div className={`rounded-circle bg-${color} text-white d-flex align-items-center
                     justify-content-center fw-bold flex-shrink-0 ${className}`}
      style={style}>
      {initials}
    </div>
  );
}
