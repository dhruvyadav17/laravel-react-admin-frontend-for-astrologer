import { Navigate } from 'react-router-dom';
import NotFound     from './NotFound';
import Unauthorized from './Unauthorized';

export const errorRoutes = [
  { path: '/404',          element: <NotFound /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '/admin/unauthorized', element: <Unauthorized /> },
];
