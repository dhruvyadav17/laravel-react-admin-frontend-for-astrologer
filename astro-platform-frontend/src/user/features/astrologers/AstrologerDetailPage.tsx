import { useParams } from "react-router-dom";
import { useGetAstrologerQuery } from "../../../store/api/user.api";
import { UserLoader, UserError, UserEmpty } from "../../components/ui/UserStates";
import UserPage from "../../components/ui/UserPage";

export default function AstrologerDetailPage() {
  const { id } = useParams();

  const {
    data: astro,
    isLoading,
    isError,
  } = useGetAstrologerQuery(Number(id));

  if (isLoading) return <UserLoader text="Loading astrologer..." />;
  if (isError) return <UserError text="Error loading astrologer" />;
  if (!astro) return <UserEmpty text="Astrologer not found" />;

  const avatar =
    astro.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(astro.name)}`;

  const rating = astro.rating || 4.5;

  return (
    <UserPage title="Astrologer Profile">

      <div className="row g-4">

        {/* ================= LEFT ================= */}
        <div className="col-md-4">

          <div className="app-card text-center sticky-top astro-detail-card">

            {/* IMAGE */}
            <div className="astro-img-wrap mb-2">
              <img src={avatar} alt={astro.name} />

              <span
                className={`online-dot ${astro.is_online ? "on" : ""}`}
              />
            </div>

            {/* NAME */}
            <h4 className="fw-bold">{astro.name}</h4>

            {/* EXPERTISE */}
            <p className="text-muted mb-2">
              {astro.expertise || "Astrology Expert"}
            </p>

            {/* RATING */}
            <div className="rating-stars mb-2">
              {"★".repeat(Math.round(rating))}
              {"☆".repeat(5 - Math.round(rating))}
            </div>

            <div className="small text-muted mb-2">
              {rating.toFixed(1)} rating
            </div>

            {/* EXPERIENCE */}
            <div className="small text-muted mb-3">
              {astro.experience || 0}+ years experience
            </div>

            {/* PRICE */}
            <h5 className="text-danger mb-3">
              ₹{astro.price_per_minute}/min
            </h5>

            {astro.is_verified && (
              <span className="badge bg-success ms-2">Verified</span>
            )}
            {astro.skills?.length > 0 ? astro.skills : ["General Astrology"]}
            {/* CTA */}
            <button className="btn btn-call w-100">
              {astro.is_online ? "Talk Now" : "Currently Offline"}
            </button>

          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-md-8">

          {/* ABOUT */}
          <div className="app-card mb-3">
            <h5 className="section-title mb-2">About</h5>
            <p className="text-muted">
              {astro.bio || "No bio available"}
            </p>
          </div>

          {/* SPECIALIZATION */}
          {astro.skills?.length > 0 && (
            <div className="app-card mb-3">
              <h5 className="section-title mb-2">Specialization</h5>

              <div className="d-flex flex-wrap gap-2">
                {astro.skills.map((skill: string, i: number) => (
                  <span key={i} className="badge badge-accent px-3 py-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGES */}
          {astro.languages?.length > 0 && (
            <div className="app-card mb-3">
              <h5 className="section-title mb-2">Languages</h5>

              <div className="d-flex flex-wrap gap-2">
                {astro.languages.map((lang: string, i: number) => (
                  <span key={i} className="badge bg-light text-dark px-3 py-2">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </UserPage>
  );
}