// PATH: src/user/pages/FavoritesPage.tsx
// Saved astrologers page

import { Link } from "react-router-dom";
import { useGetAstrologersQuery } from "../../store/api/astrologer.api";
import { useFavorites } from "../../hooks/useFavorites";
import AstrologerCard from "../components/AstrologerCard";
import UserPage from "../components/ui/UserPage";
import { PageLoader } from "../../components/ui/States";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { data, isLoading } = useGetAstrologersQuery({ page: 1 });
  const all = data?.data ?? [];
  const saved = all.filter((a) => favorites.includes(a.id));

  return (
    <UserPage title="❤️ Saved Astrologers">
      {isLoading ? (
        <PageLoader />
      ) : favorites.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: 64 }} className="mb-3">❤️</div>

          <h5 className="fw-bold">No saved astrologers yet</h5>

          <p className="text-muted mb-4">
            Click the heart icon while browsing astrologers to save them here.
          </p>

          <Link to="/astrologers" className="btn btn-primary-app">
            <i className="fas fa-search me-2" />
            Browse Astrologers
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            {saved.length} saved astrologer{saved.length !== 1 ? "s" : ""}
          </p>

          <div className="row g-4">
            {saved.map((a) => (
              <div key={a.id} className="col-md-6 col-lg-4">
                <AstrologerCard astrologer={a} />
              </div>
            ))}
          </div>
        </>
      )}
    </UserPage>
  );
}