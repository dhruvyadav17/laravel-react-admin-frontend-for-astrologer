import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h3>My Profile</h3>

      <div className="card p-3">
        <p><b>Name:</b> {user?.name}</p>
        <p><b>Email:</b> {user?.email}</p>
      </div>
    </div>
  );
}