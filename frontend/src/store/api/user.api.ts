// PATH: src/store/api/user.api.ts
// FIX: getAstrologers aur getAstrologer hooks hataye
//      Ye hooks astrologer.api.ts mein hain — yahan hone se conflict hota tha
//      AstrologersPage user.api ka hook use karta tha jo /app/astrologers hit karta tha (wrong URL)

import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Sirf panchang rakhha — baaki astrologer.api.ts mein hain
    getTodayPanchang: builder.query<any, void>({
      query: () => "/app/panchang/today",
      transformResponse: (res: any) => res.data ?? {},
    }),

  }),
});

export const { useGetTodayPanchangQuery } = userApi;