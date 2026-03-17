import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";

export default function VerifyEmail() {
  const [params] = useSearchParams();

  useEffect(() => {
    const id = params.get("id");
    const hash = params.get("hash");

    if (id && hash) {
      api.get(`/email/verify/${id}/${hash}`);
    }
  }, []);

  return (
    <div className="container mt-5 text-center">
      <h4>Email Verification</h4>
      <p>
        Verifying your email…  
        You may close this page.
      </p>
    </div>
  );
}
