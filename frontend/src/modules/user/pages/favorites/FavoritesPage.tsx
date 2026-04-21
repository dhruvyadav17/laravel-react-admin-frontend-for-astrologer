/**
 * FavoritesPage — shows full astrologer cards for saved astrologers.
 * Backend returns complete astrologer objects, no local filtering needed.
 */
import { Link }            from 'react-router-dom';
import { useGetFavoriteAstrologersQuery } from '../../../../store/astrologer.api';
import AstrologerCard      from '../../components/AstrologerCard';
import UserPage            from '../../components/UserPage';
import { PageLoader, AstrologerCardSkeleton } from '../../../../components/ui/States';

export default function FavoritesPage() {
  const { data, isLoading, isFetching, refetch } = useGetFavoriteAstrologersQuery();

  const astrologers = data?.astrologers ?? [];
  const count = astrologers.length;

  return (
    <UserPage title="❤️ Saved Astrologers">
      {isLoading ? (
        <div className="row g-4">
          {[1,2,3].map(i => (
            <div key={i} className="col-md-6 col-lg-4">
              <AstrologerCardSkeleton />
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: 72 }} className="mb-3">❤️</div>
          <h5 className="fw-bold t-main mb-2">No saved astrologers yet</h5>
          <p className="t-muted mb-4">
            Click the <i className="fas fa-heart text-danger" /> icon on any astrologer card to save them here.
          </p>
          <Link to="/astrologers" className="btn btn-call px-4">
            <i className="fas fa-search me-2" />Browse Astrologers
          </Link>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <p className="t-muted mb-0 small">
              <strong className="t-main">{count}</strong> saved astrologer{count !== 1 ? 's' : ''}
            </p>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => refetch()} disabled={isFetching}>
              <i className={`fas fa-sync-alt me-1 ${isFetching ? 'fa-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="row g-4">
            {astrologers.map((a: any) => (
              <div key={a.id} className="col-md-6 col-lg-4">
                <AstrologerCard astrologer={a} />
              </div>
            ))}
          </div>

          <div className="text-center mt-5 pt-3" style={{ borderTop: '1px solid var(--bdr)' }}>
            <Link to="/astrologers" className="btn btn-outline-app px-4">
              <i className="fas fa-plus me-2" />Find More Astrologers
            </Link>
          </div>
        </>
      )}
    </UserPage>
  );
}
