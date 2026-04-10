// PATH: src/store/baseQueryWithReauth.ts
// FIX: After refresh, dispatch setToken to Redux state
//   BEFORE: sirf localStorage update hota tha → Redux state stale
//   AFTER:  api.dispatch(setToken(newToken)) → prepareHeaders fresh token paata hai

import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import { logoutThunk, setToken } from './authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

let isRefreshing    = false;
let refreshPromise: Promise<string> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      api.dispatch(logoutThunk());
      return result;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = rawBaseQuery(
        { url: '/token/refresh', method: 'POST', body: { refresh_token: refreshToken } },
        api,
        extraOptions
      )
        .then((res: any) => {
          if (!res.data?.data?.token) throw new Error('Invalid refresh response');

          const { token, refresh_token: newRefresh } = res.data.data;

          // FIX: Redux state update karo — not just localStorage
          api.dispatch(setToken(token));
          if (newRefresh) localStorage.setItem('refresh_token', newRefresh);

          return token as string;
        })
        .catch(() => {
          api.dispatch(logoutThunk());
          throw new Error('Token refresh failed');
        })
        .finally(() => {
          isRefreshing   = false;
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      return result;
    }
  }

  return result;
};
