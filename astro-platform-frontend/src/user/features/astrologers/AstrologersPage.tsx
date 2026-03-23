import { useGetAstrologersQuery } from "../../../store/api/user.api";

export default function AstrologersPage() {
  const { data = [], isLoading } = useGetAstrologersQuery();

  if (isLoading) {
    return <p className="text-center mt-5">Loading Astrologers...</p>;
  }

  return (
    <div className="container">

      {/* TITLE */}
      <div className="text-center mb-4">
        <h2 className="text-danger fw-bold">🔮 Our Astrologers</h2>
        <p className="text-muted">
          Talk to experienced astrologers
        </p>
      </div>

      {/* LIST */}
      <div className="row g-4">

        {data.map((astro: any) => (
          <div className="col-md-4" key={astro.id}>

            <div className="card shadow p-3 h-100">

              {/* IMAGE */}
              <div className="text-center mb-3">
                <img
                  src={astro.profile_image || "https://via.placeholder.com/100"}
                  alt={astro.name}
                  className="rounded-circle"
                  width={80}
                  height={80}
                />
              </div>

              {/* DETAILS */}
              <h5 className="text-center">{astro.name}</h5>

              <p className="text-muted text-center">
                {astro.expertise || "Astrology Expert"}
              </p>

              <p className="text-center">
                ⭐ {astro.rating || "4.5"}
              </p>

              <p className="text-center fw-bold text-danger">
                ₹ {astro.price_per_minute || 20}/min
              </p>

              {/* BUTTON */}
              <button className="btn btn-danger w-100 mt-2">
                Talk Now
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}