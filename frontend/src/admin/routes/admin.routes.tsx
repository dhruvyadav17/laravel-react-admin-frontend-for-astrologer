// PATH: src/admin/routes/admin.routes.tsx
// IMPROVED: Lazy loading — each page loads on demand
// IMPROVED: UnauthorizedPage as reusable component

import { lazy, Suspense }   from 'react';
import { Navigate, Link }   from 'react-router-dom';
import AdminGuard            from '../../routes/guards/AdminGuard';
import AdminLayout           from '../layouts/AdminLayout';

/* ── Lazy page imports ──────────────────────── */
const DashboardPage    = lazy(() => import('../../features/admin/dashboard/DashboardPage'));
const UsersPage        = lazy(() => import('../../features/admin/users/UsersPage'));
const AstrologersPage  = lazy(() => import('../../features/admin/astrologers/AstrologersPage'));
const RolesPage        = lazy(() => import('../../features/admin/roles/RolesPage'));
const PermissionsPage  = lazy(() => import('../../features/admin/permissions/PermissionsPage'));
const AdminProfilePage = lazy(() => import('../../features/admin/profile/AdminProfilePage'));
const ActivityPage     = lazy(() => import('../../features/admin/activity/ActivityPage'));

function PageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}

function L({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const adminRoutes = {
  path:    'admin',
  element: <AdminGuard />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true,          element: <Navigate to="dashboard" replace />        },
        { path: 'dashboard',    element: <L><DashboardPage /></L>                   },
        { path: 'users',        element: <L><UsersPage /></L>                       },
        { path: 'astrologers',  element: <L><AstrologersPage /></L>                 },
        { path: 'roles',        element: <L><RolesPage /></L>                       },
        { path: 'permissions',  element: <L><PermissionsPage /></L>                 },
        { path: 'profile',      element: <L><AdminProfilePage /></L>               },
        { path: 'activity',     element: <L><ActivityPage /></L>                   },
        {
          path: 'unauthorized',
          element: (
            <div className="content pt-3">
              <div className="container-fluid text-center py-5">
                <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
                <h2>403 — Unauthorized</h2>
                <p className="text-muted">You don&apos;t have permission for this page.</p>
                <Link to="/admin/dashboard" className="btn btn-primary mt-2">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ),
        },
      ],
    },
  ],
};
