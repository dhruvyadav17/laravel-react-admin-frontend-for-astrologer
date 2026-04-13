import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<{ user: any }, { name: string }>({
      query: (data) => ({ url: '/me', method: 'PATCH', body: data }),
      transformResponse: (r: any) => r.data,
      invalidatesTags: ['User'],
    }),

    getTodayPanchang: builder.query<any, void>({
      query: () => '/app/panchang/today',
      transformResponse: (res: any) => res.data ?? {},
    }),
  }),
});

export const {
  useGetTodayPanchangQuery,
  useUpdateProfileMutation,
} = userApi;
