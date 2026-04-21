import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { adminRoutes }      from '../modules/admin/routes';
import { authRoutes }       from '../modules/auth/routes';
import { userRoutes }       from '../modules/user/routes';
import { astrologerRoutes } from '../modules/astrologer/routes';
import { errorRoutes }      from './error.routes';

function Spinner() {
  return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-danger" /></div>;
}
export { Spinner as SuspenseWrap };

const router = createBrowserRouter([
  authRoutes,
  userRoutes,
  adminRoutes,
  astrologerRoutes,
  ...errorRoutes,
  { path: '*', element: <Navigate to="/404" replace /> },
]);

export default function AppRoutes() {
  return <Suspense fallback={<Spinner />}><RouterProvider router={router} /></Suspense>;
}
