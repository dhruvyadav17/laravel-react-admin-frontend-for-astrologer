import { useAuth } from "../../../auth/hooks/useAuth";

export default function ProfileRoles() {
  const { user } = useAuth();

  if (!user?.roles?.length) {
    return (
      <p className="text-muted">
        No roles assigned to you.
      </p>
    );
  }

  return (
    <ul className="list-group list-group-flush">
      {user.roles.map((role) => (
        <li
          key={role}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          {role}
          <span className="badge bg-primary">
            Active
          </span>
        </li>
      ))}
    </ul>
  );
}
