import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Update display name and/or profile image
    updateProfile: builder.mutation<{ user: any }, {
      name?: string;
      profile_image?: string | null;
    }>({
      query: (data) => ({ url: '/me', method: 'PATCH', body: data }),
      transformResponse: (r: any) => r.data,
      invalidatesTags: ['User'],
    }),

    // Change password (requires current_password + new_password)
    changePassword: builder.mutation<void, {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }>({
      query: (data) => ({ url: '/me', method: 'PATCH', body: data }),
    }),

    getTodayPanchang: builder.query<any, void>({
      query: () => '/app/panchang/today',
      transformResponse: (res: any) => res.data ?? {},
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetTodayPanchangQuery,
} = userApi;
