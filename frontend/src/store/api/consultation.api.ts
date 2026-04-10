// PATH: src/store/api/consultation.api.ts
// FIX: Consultation + ChatMessage types models.ts se import kiye
//   Was redeclared here → type drift risk

import { baseApi }  from './baseApi';
import type { Consultation, ChatMessage, ConsultationType } from '../../types/models';

export type { Consultation, ChatMessage };

const consultationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    bookConsultation: build.mutation<
      Consultation,
      { astrologer_id: number; type: Exclude<ConsultationType, 'all'>; user_note?: string }
    >({
      query: (body) => ({ url: '/consultations', method: 'POST', body }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    myConsultations: build.query<
      { data: Consultation[]; pagination: any },
      { status?: string; page?: number } | void
    >({
      query: (params) => ({ url: '/consultations', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.meta ?? null }),
      providesTags: [{ type: 'Consultation', id: 'LIST' }],
    }),

    getConsultation: build.query<Consultation, number>({
      query: (id) => `/consultations/${id}`,
      transformResponse: (res: any): Consultation => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    cancelConsultation: build.mutation<void, number>({
      query: (id) => ({ url: `/consultations/${id}/cancel`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'LIST' },
      ],
    }),

    getMessages: build.query<ChatMessage[], number>({
      query: (id) => `/consultations/${id}/messages`,
      transformResponse: (res: any): ChatMessage[] => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),

    sendMessage: build.mutation<ChatMessage, { consultationId: number; message: string }>({
      query: ({ consultationId, message }) => ({
        url: `/consultations/${consultationId}/messages`, method: 'POST', body: { message },
      }),
      transformResponse: (res: any): ChatMessage => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    astrologerGetConsultation: build.query<Consultation, number>({
      query: (id) => `/astrologer/consultations/${id}`,
      transformResponse: (res: any): Consultation => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Consultation', id }],
    }),

    astrologerConsultations: build.query<
      { data: Consultation[]; pagination: any },
      { status?: string; page?: number } | void
    >({
      query: (params) => ({ url: '/astrologer/consultations', params: params ?? {} }),
      transformResponse: (res: any) => ({ data: res.data ?? [], pagination: res.meta ?? null }),
      providesTags: [{ type: 'Consultation', id: 'ASTRO-LIST' }],
    }),

    acceptConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/accept`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    rejectConsultation: build.mutation<void, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/astrologer/consultations/${id}/reject`, method: 'PATCH', body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    startConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/start`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    endConsultation: build.mutation<Consultation, number>({
      query: (id) => ({ url: `/astrologer/consultations/${id}/end`, method: 'PATCH' }),
      transformResponse: (res: any): Consultation => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: 'Consultation', id },
        { type: 'Consultation', id: 'ASTRO-LIST' },
      ],
    }),

    astrologerSendMessage: build.mutation<ChatMessage, { consultationId: number; message: string }>({
      query: ({ consultationId, message }) => ({
        url: `/astrologer/consultations/${consultationId}/messages`, method: 'POST', body: { message },
      }),
      transformResponse: (res: any): ChatMessage => res.data,
      invalidatesTags: (_r, _e, { consultationId }) => [{ type: 'ChatMessage', id: consultationId }],
    }),

    astrologerGetMessages: build.query<ChatMessage[], number>({
      query: (id) => `/astrologer/consultations/${id}/messages`,
      transformResponse: (res: any): ChatMessage[] => res.data ?? [],
      providesTags: (_r, _e, id) => [{ type: 'ChatMessage', id }],
    }),
  }),
});

export const {
  useBookConsultationMutation, useMyConsultationsQuery,
  useGetConsultationQuery, useCancelConsultationMutation,
  useGetMessagesQuery, useSendMessageMutation,
  useAstrologerGetConsultationQuery, useAstrologerConsultationsQuery,
  useAcceptConsultationMutation, useRejectConsultationMutation,
  useStartConsultationMutation, useEndConsultationMutation,
  useAstrologerSendMessageMutation, useAstrologerGetMessagesQuery,
} = consultationApi;
