import { lazy, Suspense }   from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }           from '../../modules/auth/hooks/useAuth';
import AstrologerLayout      from './layouts/AstrologerLayout';
import { ErrorBoundary }     from '../../components/feedback/ErrorBoundary';

const DashboardPage      = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProfilePage        = lazy(() => import('./pages/profile/ProfilePage'));
const SchedulePage       = lazy(() => import('./pages/schedule/SchedulePage'));
const MyReviewsPage      = lazy(() => import('./pages/reviews/MyReviewsPage'));
const EarningsPage       = lazy(() => import('./pages/earnings/EarningsPage'));
const ConsultationsPage  = lazy(() => import('./pages/consultations/ConsultationsPage'));
const AstrologerChatPage = lazy(() => import('./pages/consultations/ChatPage'));
const AstrologerCallPage = lazy(() => import('./pages/consultations/AstrologerCallPage'));

function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
    </div>
  );
}

function P({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary section={name}>
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function AstrologerGuard() {
  const { isAuth, hasRole, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary" /></div>;
  if (!isAuth)                return <Navigate to="/login"        replace />;
  if (!hasRole('astrologer')) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

export const astrologerRoutes = {
  path:    'astrologer',
  element: <AstrologerGuard />,
  children: [{
    element: <AstrologerLayout />,
    children: [
      { index: true,               element: <Navigate to="dashboard" replace />                               },
      { path: 'dashboard',         element: <P name="Dashboard"><DashboardPage /></P>                         },
      { path: 'profile',           element: <P name="Profile"><ProfilePage /></P>                             },
      { path: 'schedule',          element: <P name="Schedule"><SchedulePage /></P>                           },
      { path: 'reviews',           element: <P name="Reviews"><MyReviewsPage /></P>                           },
      { path: 'earnings',          element: <P name="Earnings"><EarningsPage /></P>                           },
      { path: 'consultations',     element: <P name="Consultations"><ConsultationsPage /></P>                 },
      { path: 'consultations/:id',      element: <P name="Consultation Chat"><AstrologerChatPage /></P>      },
      { path: 'consultations/:id/call', element: <P name="Call"><AstrologerCallPage /></P>                   },
    ],
  }],
};
