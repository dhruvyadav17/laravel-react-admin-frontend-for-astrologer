import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { adminRoutes } from '../admin/routes/admin.routes';
import { authRoutes } from './auth.routes';
import { userRoutes } from '../user/routes/user.routes';
import { astrologerRoutes } from '../astrologer/routes/astrologer.routes';
import { errorRoutes } from './error.routes';

function PageSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

export { S as SuspenseWrap };

const router = createBrowserRouter([
  authRoutes,
  userRoutes,
  astrologerRoutes,
  adminRoutes,
  ...errorRoutes,
  { path: '*', element: <Navigate to="/404" replace /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
