// PATH: src/store/api/astrologer.api.ts

import { baseApi } from './baseApi';
import type {
  Astrologer, AstrologerFilters, AstrologerSchedule,
  PaginatedResponse, Review,
} from '../../types/models';

export const astrologerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    /* ── Public listing ────────────────────────────────── */
    getAstrologers: build.query<PaginatedResponse<Astrologer>, AstrologerFilters>({
      query: (params = {}) => ({ url: '/astrologers', params }),
      transformResponse: (res: any) => {
        // Backend 2 possible structures return karta hai:
        // 1. { data: [...], meta: { pagination: {...} } }  — new format
        // 2. { data: [...], meta: [...] }                  — old format jahan meta empty array hai
        console.log('[astrologer.api] raw response:', res);
        return {
          data:       res.data             ?? [],
          pagination: res.meta?.pagination ?? res.pagination ?? null,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Astrologer' as const, id })),
              { type: 'Astrologer', id: 'LIST' },
            ]
          : [{ type: 'Astrologer', id: 'LIST' }],
    }),

    /* ── Public single ─────────────────────────────────── */
    getAstrologer: build.query<Astrologer, number>({
      query: (id) => `/astrologers/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Astrologer', id }],
    }),

    /* ── Public reviews ────────────────────────────────── */
    getAstrologerReviews: build.query<PaginatedResponse<Review>, number>({
      query: (id) => `/astrologers/${id}/reviews`,
      transformResponse: (res: any) => ({
        data:       res.data             ?? [],
        pagination: res.meta?.pagination ?? res.pagination ?? null,
      }),
      providesTags: (_r, _e, id) => [{ type: 'Review' as const, id }],
    }),

    /* ── Submit review ─────────────────────────────────── */
    submitReview: build.mutation<void, { astrologerId: number; rating: number; comment?: string }>({
      query: ({ astrologerId, ...body }) => ({
        url: `/astrologers/${astrologerId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { astrologerId }) => [
        { type: 'Review',     id: astrologerId },
        { type: 'Astrologer', id: astrologerId },
      ],
    }),

    /* ── Admin list ────────────────────────────────────── */
    adminGetAstrologers: build.query<
      PaginatedResponse<Astrologer>,
      { search?: string; is_verified?: boolean; page?: number }
    >({
      query: (params = {}) => ({ url: '/admin/astrologers', params }),
      transformResponse: (res: any) => ({
        data:       res.data             ?? [],
        pagination: res.meta?.pagination ?? res.pagination ?? null,
      }),
      providesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    /* ── Admin create ──────────────────────────────────── */
    adminCreateAstrologer: build.mutation<
      { astrologer: Astrologer; email: string; password: string },
      Partial<Astrologer>
    >({
      query: (body) => ({ url: '/admin/astrologers', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    /* ── Admin update ──────────────────────────────────── */
    adminUpdateAstrologer: build.mutation<
      Astrologer,
      { id: number; data: Partial<Astrologer> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/astrologers/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Astrologer', id },
        { type: 'Astrologer', id: 'ADMIN-LIST' },
      ],
    }),

    /* ── Admin delete ──────────────────────────────────── */
    adminDeleteAstrologer: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/astrologers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    /* ── Admin restore ─────────────────────────────────── */
    adminRestoreAstrologer: build.mutation<Astrologer, number>({
      query: (id) => ({ url: `/admin/astrologers/${id}/restore`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Astrologer', id: 'ADMIN-LIST' }],
    }),

    /* ── Admin verify ──────────────────────────────────── */
    adminVerifyAstrologer: build.mutation<Astrologer, number>({
      query: (id) => ({ url: `/admin/astrologers/${id}/verify`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Astrologer', id },
        { type: 'Astrologer', id: 'ADMIN-LIST' },
      ],
    }),

    /* ── Astrologer Portal ─────────────────────────────── */
    myAstrologerProfile: build.query<Astrologer, void>({
      query: () => '/astrologer/me',
      transformResponse: (res: any) => res.data,
      providesTags: ['MyAstrologerProfile'],
    }),

    updateMyProfile: build.mutation<Astrologer, Partial<Astrologer>>({
      query: (body) => ({ url: '/astrologer/me', method: 'PATCH', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['MyAstrologerProfile'],
    }),

    toggleAvailability: build.mutation<{ is_online: boolean; is_available: boolean }, void>({
      query: () => ({ url: '/astrologer/me/availability', method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['MyAstrologerProfile'],
    }),

    myStats: build.query<{
      rating: number;
      total_reviews: number;
      total_consultations: number;
      is_online: boolean;
      is_available: boolean;
    }, void>({
      query: () => '/astrologer/me/stats',
      transformResponse: (res: any) => res.data,
      providesTags: ['MyAstrologerProfile'],
    }),

    mySchedule: build.query<AstrologerSchedule[], void>({
      query: () => '/astrologer/me/schedule',
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['MySchedule'],
    }),

    saveSchedule: build.mutation<AstrologerSchedule[], Omit<AstrologerSchedule, 'id'>[]>({
      query: (schedules) => ({
        url: '/astrologer/me/schedule',
        method: 'POST',
        body: { schedules },
      }),
      invalidatesTags: ['MySchedule', 'MyAstrologerProfile'],
    }),

  }),
});

export const {
  useGetAstrologersQuery,
  useGetAstrologerQuery,
  useGetAstrologerReviewsQuery,
  useSubmitReviewMutation,
  useAdminGetAstrologersQuery,
  useAdminCreateAstrologerMutation,
  useAdminUpdateAstrologerMutation,
  useAdminDeleteAstrologerMutation,
  useAdminRestoreAstrologerMutation,
  useAdminVerifyAstrologerMutation,
  useMyAstrologerProfileQuery,
  useUpdateMyProfileMutation,
  useToggleAvailabilityMutation,
  useMyStatsQuery,
  useMyScheduleQuery,
  useSaveScheduleMutation,
} = astrologerApi;