// PATH: src/user/routes/user.routes.tsx
// ADD: HoroscopePage, AboutPage, FaqPage, ContactPage, PrivacyPage, TermsPage, FavoritesPage

import { Navigate, Link }         from "react-router-dom";
import UserLayout                 from "../layouts/UserLayout";
import UserGuard                  from "../../routes/guards/UserGuard";
import WelcomePage                from "../features/home/WelcomePage";
import HomePage                   from "../features/home/HomePage";
import AstrologersPage            from "../features/astrologers/AstrologersPage";
import AstrologerDetailPage       from "../features/astrologers/AstrologerDetailPage";
import ProfilePage                from "../features/profile/ProfilePage";
import PanchangPage               from "../pages/PanchangPage";
import HoroscopePage              from "../pages/HoroscopePage";
import AboutPage                  from "../pages/AboutPage";
import FaqPage                    from "../pages/FaqPage";
import ContactPage                from "../pages/ContactPage";
import PrivacyPage                from "../pages/PrivacyPage";
import TermsPage                  from "../pages/TermsPage";
import FavoritesPage              from "../pages/FavoritesPage";
import MyConsultationsPage         from "../pages/MyConsultationsPage";
import ConsultationPage            from "../pages/ConsultationPage";

export const userRoutes = {
  path:    "/",
  element: <UserLayout />,
  children: [
    { index: true,              element: <WelcomePage />          },
    { path: "home",             element: <HomePage />             },
    { path: "astrologers",      element: <AstrologersPage />      },
    { path: "astrologers/:id",  element: <AstrologerDetailPage /> },
    { path: "panchang",         element: <PanchangPage />         },
    { path: "horoscope",        element: <HoroscopePage />        },
    { path: "about",            element: <AboutPage />            },
    { path: "faq",              element: <FaqPage />              },
    { path: "contact",          element: <ContactPage />          },
    { path: "privacy",          element: <PrivacyPage />          },
    { path: "terms",            element: <TermsPage />            },
    {
      path:    "favorites",
      element: <UserGuard />,
      children: [{ index: true, element: <FavoritesPage /> }],
    },
    {
      path:    "consultations",
      element: <UserGuard />,
      children: [
        { index: true,    element: <MyConsultationsPage /> },
        { path: ":id",    element: <ConsultationPage />    },
      ],
    },
    {
      path:    "profile",
      element: <UserGuard />,
      children: [{ index: true, element: <ProfilePage /> }],
    },
    {
      path: "unauthorized",
      element: (
        <div className="container py-5 text-center">
          <i className="fas fa-ban text-danger fa-4x d-block mb-3" />
          <h2>403 — Unauthorized</h2>
          <p className="text-muted">You don't have permission to view this page.</p>
          <Link to="/" className="btn btn-primary mt-2">Go Home</Link>
        </div>
      ),
    },
  ],
};