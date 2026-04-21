/**
 * settings.api.ts — RTK Query endpoints for site settings.
 * Public endpoints (no auth): contact, about, faq, horoscope, privacy, terms
 * Admin endpoints (auth): read + write any group
 */
import { baseApi } from './baseApi';

export interface ContactSettings {
  contact_email:    string;
  contact_phone:    string;
  contact_hours:    string;
  contact_location: string;
  social_instagram: string;
  social_youtube:   string;
  social_twitter:   string;
  social_facebook:  string;
}

export interface AboutSettings {
  about_hero_title: string;
  about_hero_desc:  string;
  about_mission:    string;
  about_founded:    string;
  about_stats:      { value: string; label: string }[];
  about_team:       { name: string; role: string; expertise: string }[];
}

export interface FaqSettings {
  faq_items: { category: string; items: { q: string; a: string }[] }[];
}

export interface HoroscopeSettings {
  horoscope_predictions: Record<string, { love: string; career: string; health: string; lucky: string }>;
}

export interface PrivacySettings {
  privacy_content: { title: string; content: string }[];
}

export interface TermsSettings {
  terms_content: { title: string; content: string }[];
}

const settingsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // ── Public endpoints (no auth) ─────────────────────────────────────
    getContactSettings: b.query<ContactSettings, void>({
      query: () => '/settings/contact',
      transformResponse: (res: any) => res.data ?? {},
      providesTags: [{ type: 'SiteSettings', id: 'contact' }],
    }),

    getAboutSettings: b.query<AboutSettings, void>({
      query: () => '/settings/about',
      transformResponse: (res: any) => res.data ?? {},
      providesTags: [{ type: 'SiteSettings', id: 'about' }],
    }),

    getFaqSettings: b.query<FaqSettings, void>({
      query: () => '/settings/faq',
      transformResponse: (res: any) => res.data ?? {},
      providesTags: [{ type: 'SiteSettings', id: 'faq' }],
    }),

    getHoroscopeSettings: b.query<HoroscopeSettings, void>({
      query: () => '/settings/horoscope',
      transformResponse: (res: any) => res.data ?? {},
      providesTags: [{ type: 'SiteSettings', id: 'horoscope' }],
    }),

    getPrivacySettings: b.query<PrivacySettings, void>({
      query: () => '/settings/privacy',
      transformResponse: (res: any) => res.data ?? {},
      providesTags: [{ type: 'SiteSettings', id: 'privacy' }],
    }),

    getTermsSettings: b.query<TermsSettings, void>({
      query: () => '/settings/terms',
      transformResponse: (res: any) => res.data ?? {},
      providesTags: [{ type: 'SiteSettings', id: 'terms' }],
    }),

    // ── Submit contact form (public) ────────────────────────────────────
    submitContactForm: b.mutation<{ message: string }, {
      name: string; email: string; subject: string; message: string;
    }>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
      transformResponse: (res: any) => res,
    }),

    // ── Admin endpoints (auth required) ────────────────────────────────
    adminGetSettings: b.query<Record<string, any>, string>({
      query: (group) => `/admin/settings/${group}`,
      transformResponse: (res: any) => res.data ?? {},
      providesTags: (_r, _e, group) => [{ type: 'SiteSettings', id: `admin-${group}` }],
    }),

    adminUpdateSettings: b.mutation<void, { group: string; data: Record<string, any> }>({
      query: ({ group, data }) => ({
        url: `/admin/settings/${group}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_r, _e, { group }) => [
        { type: 'SiteSettings', id: `admin-${group}` },
        { type: 'SiteSettings', id: group },
      ],
    }),
  }),
});

export const {
  useGetContactSettingsQuery,
  useGetAboutSettingsQuery,
  useGetFaqSettingsQuery,
  useGetHoroscopeSettingsQuery,
  useGetPrivacySettingsQuery,
  useGetTermsSettingsQuery,
  useSubmitContactFormMutation,
  useAdminGetSettingsQuery,
  useAdminUpdateSettingsMutation,
} = settingsApi;
