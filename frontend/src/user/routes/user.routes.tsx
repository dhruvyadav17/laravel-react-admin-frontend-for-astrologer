// PATH: src/user/routes/user.routes.tsx
// IMPROVED: Lazy loading for all user pages
// IMPROVED: Wallet page added

import { lazy, Suspense } from 'react';
import { Navigate, Link } from 'react-router-dom';
import UserLayout          from '../layouts/UserLayout';
import UserGuard           from '../../routes/guards/UserGuard';

const WelcomePage          = lazy(() => import('../../features/user/home/WelcomePage'));
const HomePage             = lazy(() => import('../../features/user/home/HomePage'));
const AstrologersPage      = lazy(() => import('../../features/user/astrologers/AstrologersPage'));
const AstrologerDetailPage = lazy(() => import('../../features/user/astrologers/AstrologerDetailPage'));
const ProfilePage          = lazy(() => import('../../features/user/profile/ProfilePage'));
const WalletPage           = lazy(() => import('../../features/user/wallet/WalletPage'));
const PanchangPage         = lazy(() => import('../pages/PanchangPage'));
const HoroscopePage        = lazy(() => import('../pages/HoroscopePage'));
const AboutPage            = lazy(() => import('../pages/AboutPage'));
const FaqPage              = lazy(() => import('../pages/FaqPage'));
const ContactPage          = lazy(() => import('../pages/ContactPage'));
const PrivacyPage          = lazy(() => import('../pages/PrivacyPage'));
const TermsPage            = lazy(() => import('../pages/TermsPage'));
const FavoritesPage        = lazy(() => import('../pages/FavoritesPage'));
const MyConsultationsPage  = lazy(() => import('../pages/MyConsultationsPage'));
const ConsultationPage     = lazy(() => import('../pages/ConsultationPage'));

function L({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

export const userRoutes = {
  path:    '/',
  element: <UserLayout />,
  children: [
    { index: true,             element: <L><WelcomePage /></L>          },
    { path: 'home',            element: <L><HomePage /></L>             },
    { path: 'astrologers',     element: <L><AstrologersPage /></L>      },
    { path: 'astrologers/:id', element: <L><AstrologerDetailPage /></L> },
    { path: 'panchang',        element: <L><PanchangPage /></L>         },
    { path: 'horoscope',       element: <L><HoroscopePage /></L>        },
    { path: 'about',           element: <L><AboutPage /></L>            },
    { path: 'faq',             element: <L><FaqPage /></L>              },
    { path: 'contact',         element: <L><ContactPage /></L>          },
    { path: 'privacy',         element: <L><PrivacyPage /></L>          },
    { path: 'terms',           element: <L><TermsPage /></L>            },
    {
      path: 'unauthorized',
      element: (
        <div className="container py-5 text-center">
          <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
          <h2>403 — Unauthorized</h2>
          <p className="text-muted">You don&apos;t have permission to view this page.</p>
          <Link to="/" className="btn btn-primary mt-2">Go Home</Link>
        </div>
      ),
    },
    // Protected routes
    {
      element: <UserGuard />,
      children: [
        { path: 'favorites',      element: <L><FavoritesPage /></L>        },
        { path: 'wallet',         element: <L><WalletPage /></L>           },
        { path: 'profile',        element: <L><ProfilePage /></L>          },
        {
          path: 'consultations',
          children: [
            { index: true, element: <L><MyConsultationsPage /></L> },
            { path: ':id', element: <L><ConsultationPage /></L>    },
          ],
        },
      ],
    },
  ],
};
