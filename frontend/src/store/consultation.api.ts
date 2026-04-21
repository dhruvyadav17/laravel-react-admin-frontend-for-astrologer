import { baseApi } from './baseApi';
import type { Consultation, ChatMessage, ConsultationType } from '../types/models';

export type { Consultation, ChatMessage };

// Shared cache tags invalidated across consultation mutations
const consultListTags = (id: number) => [
  { type: 'Consultation' as const, id },
  { type: 'Consultation' as const, id: 'LIST' },
  { type: 'Consultation' as const, id: 'ASTRO-LIST' },
];

type SignalPayload = {
  consultationId: number;
  signal_type:    'offer' | 'answer' | 'ice-candidate' | 'hang-up';
  signal_data:    object;
};

type MessagePayload = { consultationId: number; message: string };

const consultationApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // ── User endpoints ─────────────────────────────────────────────────────

    bookConsultation: b.mutation<
      Consultation,
      { astrologer_id: number; type: Exclude<ConsultationType, 'all'>; user_note?: string }
    >({
      query: (body) => ({ url: '/consultations', method: 'POST', body }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    myConsultations: b.query<
      { data: Consultation[]; pagination: any },
      { status?: string; page?: number } | void
    >({
      query: (params) => ({ url: '/consultations', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.pagination ?? null }),
      providesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    getConsultation: b.query<Consultation, number>({
      query: (id) => `/consultations/${id}`,
      transformResponse: (res: any): Consultation => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    getUserStats: b.query<{ completed_sessions: number; total_consultations: number; total_spent: number }, void>({
      query: () => '/consultations/stats',
      transformResponse: (res: any) => res.data,
    }),

    cancelConsultation: b.mutation<void, number>({
      query: (id) => ({ url: `/consultations/${id}/cancel`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Consultation', id }, { type: 'Consultation', id: 'LIST' }],
    }),

    getMessages: b.query<ChatMessage[], number>({
      query: (id) => `/consultations/${id}/messages`,
      transformResponse: (res: any): ChatMessage[] => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),

    sendMessage: b.mutation<ChatMessage, MessagePayload>({
      query: ({ consultationId, message }) => ({
        url: `/consultations/${consultationId}/messages`, method: 'POST', body: { message },
      }),
      transformResponse: (res: any): ChatMessage => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    getReceipt: b.query<any, number>({
      query: (id) => `/consultations/${id}/receipt`,
      transformResponse: (res: any) => res.data,
    }),

    getRecordings: b.query<any[], number>({
      query: (id) => `/consultations/${id}/recordings`,
      transformResponse: (res: any) => res.data ?? [],
    }),

    sendSignal: b.mutation<{ id: number }, SignalPayload>({
      query: ({ consultationId, ...body }) => ({
        url: `/consultations/${consultationId}/signal`, method: 'POST', body,
      }),
      transformResponse: (res: any) => res.data,
    }),

    getSignals: b.query<any[], { consultationId: number; after?: number }>({
      query: ({ consultationId, after = 0 }) => `/consultations/${consultationId}/signals?after=${after}`,
      transformResponse: (res: any) => res.data ?? [],
    }),

    updateCallStatus: b.mutation<void, { consultationId: number; call_status: string }>({
      query: ({ consultationId, call_status }) => ({
        url: `/consultations/${consultationId}/call-status`, method: 'PATCH', body: { call_status },
      }),
    }),

    // ── Astrologer endpoints ───────────────────────────────────────────────

    astrologerGetConsultation: b.query<Consultation, number>({
      query: (id) => `/astrologer/consultations/${id}`,
      transformResponse: (res: any): Consultation => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    astrologerConsultations: b.query<
      { data: Consultation[]; pagination: any },
      { status?: string; page?: number } | void
    >({
      query: (params) => ({ url: '/astrologer/consultations', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.pagination ?? null }),
      providesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    acceptConsultation: b.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/accept`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => consultListTags(id),
    }),

    rejectConsultation: b.mutation<void, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/astrologer/consultations/${id}/reject`, method: 'PATCH', body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => consultListTags(id),
    }),

    startConsultation: b.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/start`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => consultListTags(id),
    }),

    endConsultation: b.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/end`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        ...consultListTags(id),
        { type: 'Wallet', id: 'LIST' }, // refresh user balance after session ends
      ],
    }),

    astrologerGetMessages: b.query<ChatMessage[], number>({
      query: (id) => `/astrologer/consultations/${id}/messages`,
      transformResponse: (res: any): ChatMessage[] => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),

    astrologerSendMessage: b.mutation<ChatMessage, MessagePayload>({
      query: ({ consultationId, message }) => ({
        url: `/astrologer/consultations/${consultationId}/messages`, method: 'POST', body: { message },
      }),
      transformResponse: (res: any): ChatMessage => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    astrologerSendSignal: b.mutation<{ id: number }, SignalPayload>({
      query: ({ consultationId, ...body }) => ({
        url: `/astrologer/consultations/${consultationId}/signal`, method: 'POST', body,
      }),
      transformResponse: (res: any) => res.data,
    }),

    astrologerGetSignals: b.query<any[], { consultationId: number; after?: number }>({
      query: ({ consultationId, after = 0 }) =>
        `/astrologer/consultations/${consultationId}/signals?after=${after}`,
      transformResponse: (res: any) => res.data ?? [],
    }),

    astrologerUpdateCallStatus: b.mutation<void, { consultationId: number; call_status: string }>({
      query: ({ consultationId, call_status }) => ({
        url: `/astrologer/consultations/${consultationId}/call-status`, method: 'PATCH', body: { call_status },
      }),
    }),

  }),
});

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
  useSendSignalMutation,
  useGetSignalsQuery,
  useUpdateCallStatusMutation,
  useAstrologerGetConsultationQuery,
  useAstrologerConsultationsQuery,
  useAcceptConsultationMutation,
  useRejectConsultationMutation,
  useStartConsultationMutation,
  useEndConsultationMutation,
  useAstrologerGetMessagesQuery,
  useAstrologerSendMessageMutation,
  useAstrologerSendSignalMutation,
  useAstrologerGetSignalsQuery,
  useAstrologerUpdateCallStatusMutation,
  useSendTypingMutation,
  useGetTypingQuery,
  useAstrologerSendTypingMutation,
  useAstrologerGetTypingQuery,
} = consultationApi;
