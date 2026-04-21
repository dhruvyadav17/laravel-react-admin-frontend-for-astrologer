import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import { logoutThunk, setToken } from './authSlice';
import { emitLogoutEvent } from '../utils/authEvents';

// Base query — attaches Bearer token to every request.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

// Shared refresh state — prevents multiple simultaneous refresh calls.
let isRefreshing    = false;
let refreshPromise: Promise<string> | null = null;

// Wraps rawBaseQuery to handle 401s:
//   1. Try refreshing the access token using the stored refresh_token.
//   2. If refresh succeeds, retry the original request.
//   3. If refresh fails (or no refresh_token), broadcast logout to all tabs then clear session.
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    emitLogoutEvent(); // tell other tabs to log out too
    api.dispatch(logoutThunk());
    return result;
  }

  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = (async () => {
      const res: any = await rawBaseQuery(
        { url: '/token/refresh', method: 'POST', body: { refresh_token: refreshToken } },
        api,
        extraOptions,
      );

      if (!res.data?.data?.token) throw new Error('Invalid refresh response');

      const { token, refresh_token: newRefresh } = res.data.data;
      api.dispatch(setToken(token));
      if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
      return token as string;
    })().catch(() => {
      emitLogoutEvent();
      api.dispatch(logoutThunk());
      throw new Error('Token refresh failed');
    }).finally(() => {
      isRefreshing   = false;
      refreshPromise = null;
    });
  }

  try {
    await refreshPromise;
    return await rawBaseQuery(args, api, extraOptions);
  } catch {
    return result;
  }
};
