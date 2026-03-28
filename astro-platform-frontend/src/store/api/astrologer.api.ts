import { baseApi } from "./baseApi";

export const astrologerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ================= LIST ================= */
    getAdminAstrologers: builder.query<any[], void>({
      query: () => "/admin/astrologers",
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ["Astrologer"],
    }),

    /* ================= CREATE ================= */
    createAstrologer: builder.mutation({
      query: (data) => ({
        url: "/admin/astrologers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Astrologer"],
    }),

    /* ================= UPDATE ================= */
    updateAstrologer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/astrologers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Astrologer"],
    }),

    /* ================= DELETE ================= */
    deleteAstrologer: builder.mutation({
      query: (id) => ({
        url: `/admin/astrologers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Astrologer"],
    }),

  }),
});

export const {
  useGetAdminAstrologersQuery,
  useCreateAstrologerMutation,
  useUpdateAstrologerMutation,
  useDeleteAstrologerMutation,
} = astrologerApi;