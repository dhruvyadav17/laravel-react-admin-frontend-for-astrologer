import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/axios";
import { execute } from "../../utils/feedback";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      // ✅ centralized error toast
      throw new Error("Passwords do not match");
    }

    await execute(
      async () => {
        setLoading(true);

        const res = await api.post("/reset-password", {
          email,
          token,
          password,
          password_confirmation: confirm,
        });

        navigate("/login", { replace: true });
        return res;
      },
      {
        defaultMessage: "Password reset successfully",
      }
    ).finally(() => setLoading(false));
  };

  if (!token || !email) {
    return <p className="text-danger">Invalid reset link</p>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h4>Reset Password</h4>

      <form onSubmit={submit}>
        <input
          type="password"
          className="form-control mb-3"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
