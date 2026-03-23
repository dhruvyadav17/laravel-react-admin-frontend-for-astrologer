import { useLogout } from "../../../auth/hooks/useLogout";

type Props = {
  redirectTo?: string;
  className?: string;
  variant?: "dropdown" | "sidebar";
};

export default function AdminLogoutButton({
  redirectTo = "/admin/login",
  className = "",
  variant = "dropdown",
}: Props) {
  const logout = useLogout();

  const handleLogout = () => {
    logout(redirectTo);
  };

  /* ================= SIDEBAR STYLE ================= */

  if (variant === "sidebar") {
    return (
      <a
        href="#"
        className={`nav-link text-danger ${className}`}
        onClick={(e) => {
          e.preventDefault();
          handleLogout();
        }}
      >
        <i className="fas fa-sign-out-alt nav-icon" />
        <p>Logout</p>
      </a>
    );
  }

  /* ================= DROPDOWN STYLE ================= */

  return (
    <button
      className={`dropdown-item text-danger ${className}`}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
