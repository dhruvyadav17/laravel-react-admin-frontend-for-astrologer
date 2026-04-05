// PATH: src/store/api/consultation.api.ts
// NEW: Consultation endpoints — book, list, cancel, messages

import { baseApi } from './baseApi';

export interface Consultation {
  id:                number;
  type:              'chat' | 'call' | 'video';
  status:            'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  user_note?:        string;
  rejection_reason?: string;
  rate_per_minute:   number;
  total_amount?:     number;
  duration_minutes?: number;
  started_at?:       string;
  ended_at?:         string;
  created_at:        string;
  user?:             { id: number; name: string; profile_image?: string };
  astrologer?:       { id: number; name: string; profile_image?: string; expertise?: string; price_per_minute: number };
}

export interface ChatMessage {
  id:          number;
  message:     string;
  is_read:     boolean;
  created_at:  string;
  sender:      { id: number; name: string; profile_image?: string };
}

const consultationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    /* ── User: Book ─────────────────────────── */
    bookConsultation: build.mutation<Consultation, {
      astrologer_id: number; type: 'chat' | 'call' | 'video'; user_note?: string;
    }>({
      query: (body) => ({ url: '/consultations', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    /* ── User: My list ──────────────────────── */
    myConsultations: build.query<{ data: Consultation[]; pagination: any }, { status?: string }>({
      query: (params) => ({ url: '/consultations', params }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.meta ?? null }),
      providesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    /* ── User: Single ───────────────────────── */
    getConsultation: build.query<Consultation, number>({
      query: (id) => `/consultations/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    /* ── User: Cancel ───────────────────────── */
    cancelConsultation: build.mutation<void, number>({
      query: (id) => ({ url: `/consultations/${id}/cancel`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    /* ── Get messages ───────────────────────── */
    getMessages: build.query<ChatMessage[], number>({
      query: (id) => `/consultations/${id}/messages`,
      transformResponse: (res: any) => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),

    /* ── User: Send message ─────────────────── */
    sendMessage: build.mutation<ChatMessage, { consultationId: number; message: string }>({
      query: ({ consultationId, message }) => ({
        url: `/consultations/${consultationId}/messages`, method: 'POST', body: { message },
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    /* ── Astrologer: List ───────────────────── */
    astrologerConsultations: build.query<{ data: Consultation[]; pagination: any }, { status?: string }>({
      query: (params) => ({ url: '/astrologer/consultations', params }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.meta ?? null }),
      providesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    /* ── Astrologer: Accept ─────────────────── */
    acceptConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/accept`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    /* ── Astrologer: Reject ─────────────────── */
    rejectConsultation: build.mutation<void, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/astrologer/consultations/${id}/reject`, method: 'PATCH', body: { reason },
      }),
      invalidatesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    /* ── Astrologer: Start ──────────────────── */
    startConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/start`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    /* ── Astrologer: End ────────────────────── */
    endConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/end`, method: 'PATCH' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    /* ── Astrologer: Send message ───────────── */
    astrologerSendMessage: build.mutation<ChatMessage, { consultationId: number; message: string }>({
      query: ({ consultationId, message }) => ({
        url: `/astrologer/consultations/${consultationId}/messages`, method: 'POST', body: { message },
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

  }),
});

export const {
  useBookConsultationMutation,
  useMyConsultationsQuery,
  useGetConsultationQuery,
  useCancelConsultationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useAstrologerConsultationsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
  useAstrologerSendMessageMutation,
} = consultationApi;