// PATH: src/astrologer/routes/astrologer.routes.tsx
// IMPROVED: Lazy loading for all astrologer pages

import { lazy, Suspense }    from 'react';
import { Navigate, Outlet }  from 'react-router-dom';
import { useAuth }            from '../../auth/hooks/useAuth';
import AstrologerLayout       from '../layouts/AstrologerLayout';

const DashboardPage     = lazy(() => import('../../features/astrologer/dashboard/DashboardPage'));
const ProfilePage       = lazy(() => import('../../features/astrologer/profile/ProfilePage'));
const SchedulePage      = lazy(() => import('../../features/astrologer/schedule/SchedulePage'));
const MyReviewsPage     = lazy(() => import('../../features/astrologer/reviews/MyReviewsPage'));
const EarningsPage      = lazy(() => import('../../features/astrologer/earnings/EarningsPage'));
const ConsultationsPage = lazy(() => import('../../features/astrologer/consultations/ConsultationsPage'));
const AstrologerChatPage = lazy(() => import('../../features/astrologer/consultations/ChatPage'));

function L({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

function AstrologerGuard() {
  const { isAuth, hasRole, loading } = useAuth();
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
  if (!isAuth)                return <Navigate to="/login"        replace />;
  if (!hasRole('astrologer')) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

export const astrologerRoutes = {
  path:    'astrologer',
  element: <AstrologerGuard />,
  children: [
    {
      element: <AstrologerLayout />,
      children: [
        { index: true,              element: <Navigate to="dashboard" replace />          },
        { path: 'dashboard',        element: <L><DashboardPage /></L>                     },
        { path: 'profile',          element: <L><ProfilePage /></L>                       },
        { path: 'schedule',         element: <L><SchedulePage /></L>                      },
        { path: 'reviews',          element: <L><MyReviewsPage /></L>                     },
        { path: 'earnings',         element: <L><EarningsPage /></L>                      },
        { path: 'consultations',    element: <L><ConsultationsPage /></L>                 },
        { path: 'consultations/:id',element: <L><AstrologerChatPage /></L>                },
      ],
    },
  ],
};
