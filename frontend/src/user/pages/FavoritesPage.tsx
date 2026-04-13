import { Link }                      from 'react-router-dom';
import { useGetAstrologersQuery }     from '../../store/api/astrologer.api';
import { useFavorites }               from '../../hooks/useFavorites';
import AstrologerCard                 from '../components/AstrologerCard';
import UserPage                       from '../components/ui/UserPage';
import { PageLoader }                 from '../../components/ui/States';

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  // Fetch with high per_page so we can filter locally
  // (backend doesn't support filter-by-ids yet)
  const { data, isLoading } = useGetAstrologersQuery({ page: 1, per_page: 48 } as any);

  const all   = data?.data ?? [];
  const saved = all.filter(a => favorites.includes(a.id));

  return (
    <UserPage title="❤️ Saved Astrologers">
      {isLoading ? (
        <PageLoader />
      ) : favorites.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: 64 }} className="mb-3">❤️</div>
          <h5 className="fw-bold t-main">No saved astrologers yet</h5>
          <p className="t-muted mb-4">
            Click the ♥ icon on any astrologer to save them here.
          </p>
          <Link to="/astrologers" className="btn btn-call px-4">
            <i className="fas fa-search me-2" />Browse Astrologers
          </Link>
        </div>
      ) : (
        <>
          <p className="t-muted mb-4 small">
            <strong className="t-main">{saved.length}</strong> saved astrologer{saved.length !== 1 ? 's' : ''}
          </p>
          <div className="row g-4">
            {saved.map(a => (
              <div key={a.id} className="col-md-6 col-lg-4">
                <AstrologerCard astrologer={a} />
              </div>
            ))}
          </div>

          {/* If there are favorites not loaded in current page */}
          {favorites.length > saved.length && (
            <div className="text-center mt-4">
              <p className="t-muted small">
                {favorites.length - saved.length} saved astrologer(s) may be offline or unavailable.
              </p>
            </div>
          )}
        </>
      )}
    </UserPage>
  );
}
