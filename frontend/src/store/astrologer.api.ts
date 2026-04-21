import { baseApi } from './baseApi';
import type {
  Astrologer, AstrologerFilters, AstrologerSchedule, PaginatedResponse, Review,
} from '../types/models';

export const astrologerApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // ── Public (no auth required) ──────────────────────────────────────────

    getAstrologers: b.query<PaginatedResponse<Astrologer>, AstrologerFilters>({
      query: (params = {}) => ({ url: '/astrologers', params }),
      transformResponse: (res: any) => ({
        data:       res.data ?? [],
        pagination: res.meta?.pagination ?? res.pagination ?? null,
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Astrologer' as const, id })), { type: 'Astrologer', id: 'LIST' }]
          : [{ type: 'Astrologer', id: 'LIST' }],
    }),

    getAstrologer: b.query<Astrologer, number>({
      query: (id) => `/astrologers/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Astrologer', id }],
    }),

    getAstrologerReviews: b.query<{ data: Review[]; pagination?: any }, { id: number; page?: number }>({
      query: ({ id, page = 1 }) => ({ url: `/astrologers/${id}/reviews`, params: { page } }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.meta?.pagination ?? null }),
    }),

    getFavoriteAstrologers: b.query<{ ids: number[]; astrologers: any[] }, void>({
      query: () => '/favorites',
      transformResponse: (res: any) => ({
        ids:         res.data?.ids         ?? [],
        astrologers: res.data?.astrologers ?? [],
      }),
      providesTags: ['Favorite'],
    }),

    submitReview: b.mutation<void, { astrologerId: number; rating: number; comment?: string }>({
      query: ({ astrologerId, ...body }) => ({
        url: `/astrologers/${astrologerId}/reviews`, method: 'POST', body,
      }),
      invalidatesTags: (_r, _e, { astrologerId }) => [
        { type: 'Review', id: astrologerId },
        { type: 'Astrologer', id: astrologerId },
      ],
    }),

    // ── Admin ─────────────────────────────────────────────────────────────

    adminGetAstrologers: b.query<PaginatedResponse<Astrologer>, { search?: string; is_verified?: boolean; page?: number }>({
      query: (params = {}) => ({ url: '/admin/astrologers', params }),
      transformResponse: (res: any) => ({
        data:       res.data ?? [],
        pagination: res.meta?.pagination ?? res.pagination ?? null,
      }),
      providesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    adminCreateAstrologer: b.mutation<{ astrologer: Astrologer; email: string; password: string }, Partial<Astrologer>>({
      query: (body) => ({ url: '/admin/astrologers', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    adminUpdateAstrologer: b.mutation<Astrologer, { id: number } & Partial<Astrologer>>({
      query: ({ id, ...data }) => ({ url: `/admin/astrologers/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Astrologer', id }, { type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    adminDeleteAstrologer: b.mutation<void, number>({
      query: (id) => ({ url: `/admin/astrologers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    adminRestoreAstrologer: b.mutation<Astrologer, number>({
      query: (id) => ({ url: `/admin/astrologers/${id}/restore`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    adminVerifyAstrologer: b.mutation<Astrologer, number>({
      query: (id) => ({ url: `/admin/astrologers/${id}/verify`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: 'Astrologer', id }, { type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    // ── Astrologer portal ─────────────────────────────────────────────────

    myAstrologerProfile: b.query<Astrologer, void>({
      query: () => '/astrologer/me',
      transformResponse: (res: any) => res.data,
      providesTags: ['MyAstrologerProfile'],
    }),

    updateMyProfile: b.mutation<Astrologer, Partial<Astrologer> & { profile_image?: string }>({
      query: (body) => ({ url: '/astrologer/me', method: 'PATCH', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['MyAstrologerProfile'],
    }),

    toggleAvailability: b.mutation<{ is_online: boolean; is_available: boolean }, void>({
      query: () => ({ url: '/astrologer/me/availability', method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['MyAstrologerProfile'],
    }),

    myStats: b.query<{ rating: number; total_reviews: number; total_consultations: number; is_online: boolean; is_available: boolean }, void>({
      query: () => '/astrologer/me/stats',
      transformResponse: (res: any) => res.data,
      providesTags: ['MyAstrologerProfile'],
    }),

    mySchedule: b.query<AstrologerSchedule[], void>({
      query: () => '/astrologer/me/schedule',
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['MySchedule'],
    }),

    saveSchedule: b.mutation<AstrologerSchedule[], Omit<AstrologerSchedule, 'id'>[]>({
      query: (schedules) => ({ url: '/astrologer/me/schedule', method: 'POST', body: { schedules } }),
      invalidatesTags: ['MySchedule', 'MyAstrologerProfile'],
    }),

    myEarnings: b.query<{ summary: any; data: any[] }, void>({
      query: () => '/astrologer/me/earnings',
      transformResponse: (res: any) => res.data ?? { summary: {}, data: [] },
      providesTags: ['MyAstrologerProfile'],
    }),

    sendHeartbeat: b.mutation<{ is_online: boolean; is_available: boolean }, void>({
      query: () => ({ url: '/astrologer/me/heartbeat', method: 'POST' }),
      transformResponse: (res: any) => res.data,
    }),

  }),
});

export const {
  useGetAstrologersQuery, useGetAstrologerQuery,
  useGetAstrologerReviewsQuery, useSubmitReviewMutation,
  useAdminGetAstrologersQuery, useAdminCreateAstrologerMutation,
  useAdminUpdateAstrologerMutation, useAdminDeleteAstrologerMutation,
  useAdminRestoreAstrologerMutation, useAdminVerifyAstrologerMutation,
  useMyAstrologerProfileQuery, useUpdateMyProfileMutation,
  useToggleAvailabilityMutation, useMyStatsQuery,
  useMyScheduleQuery, useSaveScheduleMutation,
  useMyEarningsQuery, useSendHeartbeatMutation,
} = astrologerApi;
