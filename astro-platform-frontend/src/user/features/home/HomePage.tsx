import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetAstrologersQuery } from "../../../store/api/user.api";
import { useAuth } from "../../../auth/hooks/useAuth";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data = [], isLoading } = useGetAstrologersQuery();

  const astrologers = data; // ✅ FIX

  /* ================= ROLE CHECK ================= */

  const roles = user?.roles || [];

  const isAstrologer = roles.includes("astrologer");
  const isUser = roles.includes("user") || roles.length === 0;

  /* ================= AUTO REDIRECT ================= */

  useEffect(() => {
    if (!isLoading && isUser && astrologers.length === 1) {
      navigate(`/astrologers/${astrologers[0].id}`);
    }
  }, [isLoading, astrologers, isUser, navigate]);

  /* ================= ASTROLOGER VIEW ================= */

  if (isAstrologer) {
    return (
      <div>
        <h3>My Profile (Astrologer)</h3>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>

        <button
          className="btn btn-primary btn-sm mt-2"
          onClick={() => navigate("/profile")}
        >
          Edit Profile
        </button>
      </div>
    );
  }

  /* ================= USER VIEW ================= */

  if (isUser) {
    return (
      <div>
        <h4 className="mb-3">Astrologers</h4>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="row">
            {astrologers.map((astro: any) => (
              <div key={astro.id} className="col-md-3 mb-3">
                <div className="card p-3 shadow-sm">
                  <h5>{astro.name}</h5>
                  <p className="text-muted">{astro.email}</p>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate(`/astrologers/${astro.id}`)
                    }
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ================= FALLBACK ================= */

  return <p>No role assigned</p>;
}