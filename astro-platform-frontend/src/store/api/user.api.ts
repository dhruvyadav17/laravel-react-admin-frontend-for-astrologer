import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAstrologers: builder.query<any[], void>({
      query: () => "/app/astrologers",
      transformResponse: (res: any) => res.data ?? [],
    }),

    getTodayPanchang: builder.query<any, void>({
      query: () => "/app/panchang/today",
      transformResponse: (res: any) => res.data ?? {},
    }),
  }),
});

export const {
  useGetAstrologersQuery,
  useGetTodayPanchangQuery,
} = userApi;