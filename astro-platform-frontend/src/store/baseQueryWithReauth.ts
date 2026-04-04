// PATH: src/store/baseQueryWithReauth.ts
// FIX BUG-9: Refresh token URL galat tha
//   BEFORE: url: "/refresh-token"  → hits /api/v1/refresh-token → 404
//   AFTER:  url: "/token/refresh"  → hits /api/v1/token/refresh → correct!
//   Backend route: POST /api/v1/token/refresh (routes/api/v1.php line 33)
//   VITE_API_URL=http://localhost:8000/api/v1 (already has /v1 prefix)
// IMPROVEMENT: refreshPromise null reset in finally — pehle sirf isRefreshing reset hota tha
//              agar refresh fail ho toh agle request pe refreshPromise = stale promise rehta tha

import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { logoutThunk } from "./authSlice";

/* =====================================================
   BASE QUERY — token attach, Accept header
===================================================== */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

/* =====================================================
   REFRESH LOCK — multiple 401s ek hi refresh trigger karein
===================================================== */
let isRefreshing    = false;
let refreshPromise: Promise<string> | null = null;

/* =====================================================
   BASE QUERY WITH RE-AUTH
===================================================== */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  /* ── 401 → try token refresh ──────────────────── */
  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");

    /* No refresh token → logout immediately */
    if (!refreshToken) {
      api.dispatch(logoutThunk());
      return result;
    }

    /* Prevent multiple simultaneous refresh calls */
    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = rawBaseQuery(
        {
          url:    "/token/refresh",   // FIX BUG-9: was "/refresh-token" (404)
          method: "POST",
          body:   { refresh_token: refreshToken },
        },
        api,
        extraOptions
      )
        .then((res: any) => {
          if (!res.data?.data?.token) {
            throw new Error("Invalid refresh response");
          }

          const { token, refresh_token: newRefresh } = res.data.data;

          localStorage.setItem("token", token);
          if (newRefresh) {
            localStorage.setItem("refresh_token", newRefresh);
          }

          return token as string;
        })
        .catch(() => {
          api.dispatch(logoutThunk());
          throw new Error("Token refresh failed");
        })
        .finally(() => {
          isRefreshing   = false;
          refreshPromise = null;   // FIX IMPROVEMENT: stale promise clear karo
        });
    }

    try {
      /* Wait for refresh to complete (works for concurrent 401s too) */
      await refreshPromise;

      /* Retry original request with fresh token */
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      /* Refresh failed — result already has 401, return it */
      return result;
    }
  }

  return result;
};
