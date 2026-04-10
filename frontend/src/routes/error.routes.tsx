// PATH: src/routes/error.routes.tsx
// FIX F4: Duplicate wildcard (*) — error.routes aur AppRoutes dono mein tha → routing conflict
// FIX: Wildcard hata diya — AppRoutes mein sirf ek * rakha

import NotFound     from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';

export const errorRoutes = [
  { path: '/admin/unauthorized', element: <Unauthorized /> },
  { path: '/404',                element: <NotFound />     },
  // Removed duplicate: { path: '*', element: <NotFound /> }
  // AppRoutes mein: { path: '*', element: <Navigate to="/404" /> } handles it
];
