// FIX: Removed wildcard here -- only one * kept in AppRoutes

import NotFound     from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';

export const errorRoutes = [
  { path: '/admin/unauthorized', element: <Unauthorized /> },
  { path: '/404',                element: <NotFound />     },
  // Removed duplicate: { path: '*', element: <NotFound /> }
  // In AppRoutes: { path: '*', element: <Navigate to="/404" /> } handles it
];
