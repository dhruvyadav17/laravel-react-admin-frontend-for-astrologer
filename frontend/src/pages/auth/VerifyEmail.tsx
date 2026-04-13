// FIX: Pehle bare axios import use karta tha -- inconsistent (baaki sab RTK Query use karte hain)
//      Ab fetch directly use kiya (RTK hooks yahan use nahi ho sakte -- no auth token needed)
//              Pehle koi feedback nahi tha

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

type State = "verifying" | "success" | "error" | "missing";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState]     = useState<State>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id   = params.get("id");
    const hash = params.get("hash");

    /* No params -- just show the "check your email" message */
    if (!id || !hash) {
      setState("missing");
      return;
    }

    /* Hit the verification endpoint */
    const apiUrl = import.meta.env.VITE_API_URL ?? "";
    fetch(`${apiUrl}/email/verify/${id}/${hash}`, {
      method:  "GET",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setMessage(json.message ?? "Email verified successfully!");
          setState("success");
        } else {
          setMessage(json.message ?? "Verification failed. The link may have expired.");
          setState("error");
        }
      })
      .catch(() => {
        setMessage("Network error. Please try again.");
        setState("error");
      });
  }, []);

  /* -- Rendering ------------------------------- */
  return (
    <div className="container mt-5 text-center" style={{ maxWidth: 480 }}>
      {state === "verifying" && (
        <>
          <div className="spinner-border text-primary mb-3" role="status" />
          <h5>Verifying your email...</h5>
          <p className="t-muted small">Please wait a moment.</p>
        </>
      )}

      {state === "missing" && (
        <>
          <i className="fas fa-envelope-open text-primary fa-3x mb-3 d-block" />
          <h4 className="fw-bold">Check your inbox</h4>
          <p className="t-muted">
            A verification link has been sent to your email address.
            Click the link to verify your account.
          </p>
          <p className="t-muted small">
            Didn't receive the email? Check your spam folder or{" "}
            <Link to="/login">login to resend</Link>.
          </p>
        </>
      )}

      {state === "success" && (
        <>
          <i className="fas fa-check-circle text-success fa-3x mb-3 d-block" />
          <h4 className="fw-bold">Email Verified!</h4>
          <p className="t-muted">{message}</p>
          <Link to="/login" className="btn btn-primary mt-2">
            <i className="fas fa-sign-in-alt me-2" />
            Login to your account
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <i className="fas fa-times-circle text-danger fa-3x mb-3 d-block" />
          <h4 className="fw-bold">Verification Failed</h4>
          <p className="t-muted">{message}</p>
          <Link to="/login" className="btn btn-outline-primary mt-2">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}
