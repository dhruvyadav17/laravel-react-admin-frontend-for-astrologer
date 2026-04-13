import { lazy, Suspense } from 'react';
import { Navigate, Link } from 'react-router-dom';
import UserLayout          from '../layouts/UserLayout';
import UserGuard           from '../../routes/guards/UserGuard';
import { ErrorBoundary }  from '../../components/feedback/ErrorBoundary';

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
const CallPage             = lazy(() => import('../pages/CallPage'));

function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status" />
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

export const userRoutes = {
  path:    '/',
  element: <UserLayout />,
  children: [
    { index: true,             element: <P name="Welcome"><WelcomePage /></P>              },
    { path: 'home',            element: <P name="Home"><HomePage /></P>                    },
    { path: 'astrologers',     element: <P name="Astrologers"><AstrologersPage /></P>      },
    { path: 'astrologers/:id', element: <P name="Astrologer"><AstrologerDetailPage /></P> },
    { path: 'panchang',        element: <P name="Panchang"><PanchangPage /></P>            },
    { path: 'horoscope',       element: <P name="Horoscope"><HoroscopePage /></P>          },
    { path: 'about',           element: <P name="About"><AboutPage /></P>                  },
    { path: 'faq',             element: <P name="FAQ"><FaqPage /></P>                      },
    { path: 'contact',         element: <P name="Contact"><ContactPage /></P>              },
    { path: 'privacy',         element: <P name="Privacy"><PrivacyPage /></P>              },
    { path: 'terms',           element: <P name="Terms"><TermsPage /></P>                  },
    {
      path: 'unauthorized',
      element: (
        <div className="container py-5 text-center">
          <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
          <h2>403 -- Unauthorized</h2>
          <p className="t-muted">You don't have permission to view this page.</p>
          <Link to="/" className="btn btn-primary mt-2">Go Home</Link>
        </div>
      ),
    },
    // Protected routes (login required)
    {
      element: <UserGuard />,
      children: [
        { path: 'favorites',   element: <P name="Favorites"><FavoritesPage /></P>       },
        { path: 'wallet',      element: <P name="Wallet"><WalletPage /></P>              },
        { path: 'profile',     element: <P name="Profile"><ProfilePage /></P>            },
        {
          path: 'consultations',
          children: [
            { index: true, element: <P name="Consultations"><MyConsultationsPage /></P> },
            { path: ':id', element: <P name="Consultation"><ConsultationPage /></P>     },
            { path: ':id/call', element: <P name="Call"><CallPage /></P>                },
          ],
        },
      ],
    },
  ],
};
