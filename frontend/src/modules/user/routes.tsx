import { lazy, Suspense } from 'react';
import { Navigate, Link } from 'react-router-dom';
import UserLayout          from './layouts/UserLayout';
import UserGuard           from '../../routes/UserGuard';
import { ErrorBoundary }  from '../../components/feedback/ErrorBoundary';

const WelcomePage          = lazy(() => import('./pages/home/WelcomePage'));
const HomePage             = lazy(() => import('./pages/home/HomePage'));
const AstrologersPage      = lazy(() => import('./pages/astrologers/AstrologersPage'));
const AstrologerDetailPage = lazy(() => import('./pages/astrologers/AstrologerDetailPage'));
const ProfilePage          = lazy(() => import('./pages/profile/ProfilePage'));
const WalletPage           = lazy(() => import('./pages/wallet/WalletPage'));
const PanchangPage         = lazy(() => import('./pages/static/PanchangPage'));
const HoroscopePage        = lazy(() => import('./pages/static/HoroscopePage'));
const AboutPage            = lazy(() => import('./pages/static/AboutPage'));
const FaqPage              = lazy(() => import('./pages/static/FaqPage'));
const ContactPage          = lazy(() => import('./pages/static/ContactPage'));
const PrivacyPage          = lazy(() => import('./pages/static/PrivacyPage'));
const TermsPage            = lazy(() => import('./pages/static/TermsPage'));
const FavoritesPage        = lazy(() => import('./pages/favorites/FavoritesPage'));
const MyConsultationsPage  = lazy(() => import('./pages/consultations/MyConsultationsPage'));
const ConsultationPage     = lazy(() => import('./pages/consultations/ConsultationPage'));
const CallPage             = lazy(() => import('./pages/consultations/CallPage'));

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
