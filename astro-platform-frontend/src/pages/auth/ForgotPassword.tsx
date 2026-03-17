import { useState } from "react";
import api from "../../api/axios";
import { execute } from "../../utils/feedback";

type FormValues = {
  email: string;
};

export default function ForgotPassword() {
  const [values, setValues] = useState<FormValues>({
    email: "",
  });

  const [errors, setErrors] = useState<{
    email?: string[];
  }>({});

  const [loading, setLoading] = useState(false);

  /* ================= FIELD ================= */

  const setField = (key: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* ================= ERROR HANDLER ================= */

  const handleError = (error: any) => {
    if (error?.response?.status === 422) {
      setErrors(error.response.data?.errors || {});
    }
  };

  /* ================= SUBMIT ================= */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await execute(
        () =>
          api.post("/forgot-password", {
            email: values.email,
          }),
        {
          defaultMessage:
            "Password reset link sent to your email",
        }
      );

      setValues({ email: "" });
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h4 className="mb-3">Forgot Password</h4>

      <form onSubmit={submit}>
        <input
          type="email"
          className={`form-control mb-2 ${
            errors.email ? "is-invalid" : ""
          }`}
          placeholder="Enter your email"
          value={values.email}
          onChange={(e) =>
            setField("email", e.target.value)
          }
          disabled={loading}
          required
        />

        {errors.email && (
          <div className="invalid-feedback">
            {errors.email[0]}
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
