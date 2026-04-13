//   Pehle: DashboardPage crash = users routes bhi toot jaate
//   Ab: Har page apne ErrorBoundary mein -- isolated failures

import { lazy, Suspense }    from 'react';
import { Navigate, Link }    from 'react-router-dom';
import AdminGuard             from '../../routes/guards/AdminGuard';
import AdminLayout            from '../layouts/AdminLayout';
import { ErrorBoundary }      from '../../components/feedback/ErrorBoundary';

const DashboardPage   = lazy(() => import('../../features/admin/dashboard/DashboardPage'));
const UsersPage       = lazy(() => import('../../features/admin/users/UsersPage'));
const AstrologersPage = lazy(() => import('../../features/admin/astrologers/AstrologersPage'));
const RolesPage       = lazy(() => import('../../features/admin/roles/RolesPage'));
const PermissionsPage = lazy(() => import('../../features/admin/permissions/PermissionsPage'));
const ProfilePage     = lazy(() => import('../../features/admin/profile/AdminProfilePage'));
const ActivityPage    = lazy(() => import('../../features/admin/activity/ActivityPage'));

function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}

// Wrap with Suspense + ErrorBoundary
function P({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary section={name}>
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export const adminRoutes = {
  path:    'admin',
  element: <AdminGuard />,
  children: [{
    element: <AdminLayout />,
    children: [
      { index: true,         element: <Navigate to="dashboard" replace />                   },
      { path: 'dashboard',   element: <P name="Dashboard"><DashboardPage /></P>             },
      { path: 'users',       element: <P name="Users"><UsersPage /></P>                     },
      { path: 'astrologers', element: <P name="Astrologers"><AstrologersPage /></P>         },
      { path: 'roles',       element: <P name="Roles"><RolesPage /></P>                     },
      { path: 'permissions', element: <P name="Permissions"><PermissionsPage /></P>         },
      { path: 'profile',     element: <P name="Profile"><ProfilePage /></P>                 },
      { path: 'activity',    element: <P name="Activity Log"><ActivityPage /></P>           },
      {
        path: 'unauthorized',
        element: (
          <div className="content pt-3">
            <div className="container-fluid text-center py-5">
              <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
              <h2>403 -- Unauthorized</h2>
              <p className="text-muted">You don't have permission for this page.</p>
              <Link to="/admin/dashboard" className="btn btn-primary mt-2">Back to Dashboard</Link>
            </div>
          </div>
        ),
      },
    ],
  }],
};
