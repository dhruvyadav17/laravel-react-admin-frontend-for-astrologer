import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ================= ASTROLOGERS ================= */

    getAstrologers: builder.query<any[], void>({
      query: () => "/app/astrologers",
      transformResponse: (res: any) => res.data ?? [],
    }),

  }),
});

export const {
  useGetAstrologersQuery,
} = userApi;