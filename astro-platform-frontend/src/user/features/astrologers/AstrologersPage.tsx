import { useNavigate } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";
import { useEffect } from "react";
import UserPage from "../../components/ui/UserPage";
import { UserLoader, UserEmpty } from "../../components/ui/UserStates";
import AstrologerCard from "../../components/AstrologerCard";

export default function AstrologersPage() {
  const navigate = useNavigate();

  const { data = [], isLoading, isError } = useGetAstrologersQuery();

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    if (!isLoading && data.length === 1) {
      navigate(`/astrologers/${data[0].id}`, { replace: true });
    }
  }, [data, isLoading, navigate]);

  /* ================= STATES ================= */
  if (isLoading) return <UserLoader text="Loading astrologers..." />;
  if (isError) return <UserEmpty text="Failed to load astrologers" />;
  if (!data.length) return <UserEmpty text="No astrologers available" />;

  return (
    <UserPage title="🔮 Our Astrologers">

      {/* SUBTITLE */}
      <p className="text-center text-muted mb-4">
        Talk to experienced astrologers & get guidance instantly
      </p>

      {/* LIST */}
      <div className="row g-4">

        {data.map((astro: any) => (
          <div className="col-md-4" key={astro.id}>

            <AstrologerCard
              astrologer={astro}
              onClick={() => navigate(`/astrologers/${astro.id}`)}
            />

          </div>
        ))}

      </div>

    </UserPage>
  );
}