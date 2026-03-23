import { useGetTodayPanchangQuery } from "../../store/api/user.api";

export default function PanchangPage() {
  const { data, isLoading } = useGetTodayPanchangQuery();

  if (isLoading) {
    return <p className="text-center mt-5">Loading Panchang...</p>;
  }

  const p = data?.data;

  return (
    <div className="container">

      {/* TITLE */}
      <div className="text-center mb-4">
        <h2 className="text-danger fw-bold">📅 Today's Panchang</h2>
        <p className="text-muted">Vedic Astrology Details</p>
      </div>

      {/* CARD */}
      <div className="card shadow p-4">

        <div className="row g-3">

          <div className="col-md-4">
            <div className="p-3 border rounded text-center">
              <h6>Tithi</h6>
              <strong>{p?.tithi}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 border rounded text-center">
              <h6>Nakshatra</h6>
              <strong>{p?.nakshatra}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 border rounded text-center">
              <h6>Yoga</h6>
              <strong>{p?.yoga}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 border rounded text-center">
              <h6>Karan</h6>
              <strong>{p?.karan}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 border rounded text-center">
              <h6>Sunrise</h6>
              <strong>{p?.sunrise}</strong>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 border rounded text-center">
              <h6>Sunset</h6>
              <strong>{p?.sunset}</strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}