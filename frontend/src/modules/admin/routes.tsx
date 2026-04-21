import { lazy, Suspense }  from 'react';
import { Navigate }        from 'react-router-dom';
import AdminLayout          from './layouts/AdminLayout';
import AdminGuard           from '../../routes/AdminGuard';
import { ErrorBoundary }   from '../../components/feedback/ErrorBoundary';

const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage'));
const UsersPage        = lazy(() => import('./pages/users/UsersPage'));
const AstrologersPage  = lazy(() => import('./pages/astrologers/AstrologersPage'));
const RolesPage        = lazy(() => import('./pages/roles/RolesPage'));
const PermissionsPage  = lazy(() => import('./pages/permissions/PermissionsPage'));
const ActivityPage     = lazy(() => import('./pages/activity/ActivityPage'));
const AdminProfilePage  = lazy(() => import('./pages/profile/AdminProfilePage'));
const SiteSettingsPage         = lazy(() => import('./pages/settings/SiteSettingsPage'));
const ConsultationsReportPage = lazy(() => import('./pages/consultations/ConsultationsReportPage'));
const NewsletterPage          = lazy(() => import('./pages/newsletter/NewsletterPage'));
const EmailSettingsPage       = lazy(() => import('./pages/settings/EmailSettingsPage'));
const BroadcastPage           = lazy(() => import('./pages/broadcast/BroadcastPage'));
const PayoutsPage             = lazy(() => import('./pages/payouts/PayoutsPage'));
const ReviewsPage             = lazy(() => import('./pages/reviews/ReviewsPage'));

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

export const adminRoutes = {
  path:    'admin',
  element: <AdminGuard />,   // uses resolveLoginRedirect — correct role-based redirect
  children: [{
    element: <AdminLayout />,
    children: [
      { index: true,         element: <Navigate to="dashboard" replace />                  },
      { path: 'dashboard',   element: <P name="Dashboard"><DashboardPage /></P>            },
      { path: 'users',       element: <P name="Users"><UsersPage /></P>                    },
      { path: 'astrologers', element: <P name="Astrologers"><AstrologersPage /></P>        },
      { path: 'roles',       element: <P name="Roles"><RolesPage /></P>                    },
      { path: 'permissions', element: <P name="Permissions"><PermissionsPage /></P>        },
      { path: 'activity',    element: <P name="Activity"><ActivityPage /></P>              },
      { path: 'profile',     element: <P name="Profile"><AdminProfilePage /></P>           },
      { path: 'settings',    element: <P name="Settings"><SiteSettingsPage /></P>           },
      { path: 'consultations', element: <P name="Consultations"><ConsultationsReportPage /></P> },
      { path: 'newsletter',    element: <P name="Newsletter"><NewsletterPage /></P>               },
      { path: 'email',         element: <P name="Email"><EmailSettingsPage /></P>                 },
      { path: 'broadcast',     element: <P name="Broadcast"><BroadcastPage /></P>               },
      { path: 'payouts',       element: <P name="Payouts"><PayoutsPage /></P>                   },
      { path: 'reviews',       element: <P name="Reviews"><ReviewsPage /></P>                   },
      { path: 'unauthorized',element: <Navigate to="/unauthorized" replace />             },
    ],
  }],
};
