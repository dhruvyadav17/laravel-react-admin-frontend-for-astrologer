import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerService } from "../services/authService";
import { showError, showSuccess } from "../utils/feedback";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] =
    useState(false);

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await registerService(form);

      showSuccess(
        "Registration successful. Please verify your email."
      );

      navigate("/verify-email", {
        replace: true,
      });
    } catch (error: any) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        className="form-control mb-2"
        placeholder="Name"
        required
        value={form.name}
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <input
        className="form-control mb-2"
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <input
        className="form-control mb-2"
        type="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <input
        className="form-control mb-3"
        type="password"
        placeholder="Confirm Password"
        required
        value={form.password_confirmation}
        onChange={(e) =>
          setForm({
            ...form,
            password_confirmation:
              e.target.value,
          })
        }
      />

      <button
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading
          ? "Creating account..."
          : "Sign Up"}
      </button>
    </form>
  );
}
