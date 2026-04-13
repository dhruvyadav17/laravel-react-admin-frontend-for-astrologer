/**
 * Consultation API -- RTK Query endpoints
 *
 * All endpoints that deal with the consultation lifecycle, real-time chat,
 * WebRTC signaling, and session receipts live here.
 *
 * ADDING A NEW ENDPOINT
 * ---------------------
 * 1. Add a build.query() or build.mutation() entry inside endpoints().
 * 2. Export the generated hook at the bottom of this file.
 * 3. Add the matching route in routes/api/v1.php (Laravel backend).
 *
 * CACHE TAGS
 * ----------
 * - "Consultation" / "LIST"  -- invalidated on book / cancel / end
 * - "ChatMessage"            -- invalidated on sendMessage
 * - "Consultation" / id      -- single consultation polling
 */
import { baseApi }  from './baseApi';
import type { Consultation, ChatMessage, ConsultationType } from '../../types/models';

export type { Consultation, ChatMessage };

const consultationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    /* -- User: Book --------------------------- */
    bookConsultation: build.mutation<
      Consultation,
      { astrologer_id: number; type: Exclude<ConsultationType, 'all'>; user_note?: string }
    >({
      query: (body) => ({ url: '/consultations', method: 'POST', body }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    /* -- User: My list ------------------------ */
    myConsultations: build.query<
      { data: Consultation[]; pagination: any },
      { status?: string; page?: number } | void
    >({
      query: (params) => ({ url: '/consultations', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.pagination ?? null }),
      providesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    /* -- User: Single ------------------------- */
    getRecordings: build.query<any[], number>({
      query: (consultationId) => `/consultations/${consultationId}/recordings`,
      transformResponse: (r: any) => r.data ?? [],
    }),

    getUserStats: build.query<{ completed_sessions: number; total_consultations: number; total_spent: number }, void>({
      query: () => '/consultations/stats',
      transformResponse: (r: any) => r.data,
    }),

    getConsultation: build.query<Consultation, number>({
      query: (id) => `/consultations/${id}`,
      transformResponse: (res: any): Consultation => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    /* -- User: Cancel ------------------------- */
    cancelConsultation: build.mutation<void, number>({
      query: (id) => ({ url: `/consultations/${id}/cancel`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'LIST' },
      ],
    }),

    /* -- User: Get messages ------------------- */
    getMessages: build.query<ChatMessage[], number>({
      query: (id) => `/consultations/${id}/messages`,
      transformResponse: (res: any): ChatMessage[] => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),

    /* -- User: Send message ------------------- */
    sendMessage: build.mutation<ChatMessage, { consultationId: number; message: string }>({
      query: ({ consultationId, message }) => ({
        url: `/consultations/${consultationId}/messages`,
        method: 'POST',
        body: { message },
      }),
      transformResponse: (res: any): ChatMessage => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    /* -- Astrologer: Single ------------------- */
    /* -- User: Send WebRTC signal -------------- */
    sendSignal: build.mutation<{ id: number }, {
      consultationId: number;
      signal_type: 'offer' | 'answer' | 'ice-candidate' | 'hang-up';
      signal_data: object;
    }>({
      query: ({ consultationId, ...body }) => ({
        url: `/consultations/${consultationId}/signal`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res.data,
    }),

    /* -- User: Poll WebRTC signals ------------- */
    getSignals: build.query<any[], { consultationId: number; after?: number }>({
      query: ({ consultationId, after = 0 }) =>
        `/consultations/${consultationId}/signals?after=${after}`,
      transformResponse: (res: any) => res.data ?? [],
    }),

    /* -- User: Update call status -------------- */
    updateCallStatus: build.mutation<void, { consultationId: number; call_status: string }>({
      query: ({ consultationId, call_status }) => ({
        url: `/consultations/${consultationId}/call-status`,
        method: 'PATCH',
        body: { call_status },
      }),
    }),

    /* -- Astrologer: Send WebRTC signal -------- */
    astrologerSendSignal: build.mutation<{ id: number }, {
      consultationId: number;
      signal_type: 'offer' | 'answer' | 'ice-candidate' | 'hang-up';
      signal_data: object;
    }>({
      query: ({ consultationId, ...body }) => ({
        url: `/astrologer/consultations/${consultationId}/signal`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res.data,
    }),

    /* -- Astrologer: Poll WebRTC signals ------- */
    astrologerGetSignals: build.query<any[], { consultationId: number; after?: number }>({
      query: ({ consultationId, after = 0 }) =>
        `/astrologer/consultations/${consultationId}/signals?after=${after}`,
      transformResponse: (res: any) => res.data ?? [],
    }),

    /* -- Astrologer: Update call status -------- */
    astrologerUpdateCallStatus: build.mutation<void, { consultationId: number; call_status: string }>({
      query: ({ consultationId, call_status }) => ({
        url: `/astrologer/consultations/${consultationId}/call-status`,
        method: 'PATCH',
        body: { call_status },
      }),
    }),

    getReceipt: build.query<any, number>({
      query: (id) => `/consultations/${id}/receipt`,
      transformResponse: (res: any) => res.data,
    }),

    astrologerGetConsultation: build.query<Consultation, number>({
      query: (id) => `/astrologer/consultations/${id}`,
      transformResponse: (res: any): Consultation => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    /* -- Astrologer: List --------------------- */
    astrologerConsultations: build.query<
      { data: Consultation[]; pagination: any },
      { status?: string; page?: number } | void
    >({
      query: (params) => ({ url: '/astrologer/consultations', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.meta ?? null }),
      providesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    /* -- Astrologer: Accept ------------------- */
    acceptConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/accept`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'LIST' },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    /* -- Astrologer: Reject ------------------- */
    rejectConsultation: build.mutation<void, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/astrologer/consultations/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'LIST' },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    /* -- Astrologer: Start -------------------- */
    startConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/start`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'LIST' },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    /* -- Astrologer: End ---------------------- */
    endConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/end`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'LIST' },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    /* -- Astrologer: Send message ------------- */
    astrologerSendMessage: build.mutation<ChatMessage, { consultationId: number; message: string }>({
      query: ({ consultationId, message }) => ({
        url: `/astrologer/consultations/${consultationId}/messages`,
        method: 'POST',
        body: { message },
      }),
      transformResponse: (res: any): ChatMessage => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    /* -- Astrologer: Get messages ------------- */
    astrologerGetMessages: build.query<ChatMessage[], number>({
      query: (id) => `/astrologer/consultations/${id}/messages`,
      transformResponse: (res: any): ChatMessage[] => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),

  }),
});

/* -- Exports -- each hook on its own line ---------------------- */
export const {
  useBookConsultationMutation,
  useMyConsultationsQuery,
  useGetConsultationQuery,
  useGetUserStatsQuery,
  useGetRecordingsQuery,
  useCancelConsultationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetReceiptQuery,
  useAstrologerUpdateCallStatusMutation,
  useAstrologerGetSignalsQuery,
  useAstrologerSendSignalMutation,
  useUpdateCallStatusMutation,
  useGetSignalsQuery,
  useSendSignalMutation,
  useAstrologerGetConsultationQuery,
  useAstrologerConsultationsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
  useAstrologerSendMessageMutation,
  useAstrologerGetMessagesQuery,
} = consultationApi;
