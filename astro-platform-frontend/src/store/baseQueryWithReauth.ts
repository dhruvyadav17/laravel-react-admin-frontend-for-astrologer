import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { logoutThunk } from "./authSlice";

/* =====================================================
   BASE QUERY
   - only attaches token
   - no side effects here
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
   REFRESH TOKEN LOCK (CRITICAL)
   - prevents multiple refresh calls
===================================================== */

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

/* =====================================================
   BASE QUERY WITH RE-AUTH
===================================================== */

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  /* ================= 401 → TRY REFRESH ================= */

  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");

    /* 🔒 No refresh token → force logout */
    if (!refreshToken) {
      api.dispatch(logoutThunk());
      return result;
    }

    /* 🔒 Prevent multiple refresh calls */
    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = rawBaseQuery(
        {
          url: "/refresh-token",
          method: "POST",
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      )
        .then((res: any) => {
          if (!res.data?.data?.token) {
            throw new Error("Invalid refresh response");
          }

          const { token, refresh_token } = res.data.data;

          /* 🔐 Persist tokens */
          localStorage.setItem("token", token);
          if (refresh_token) {
            localStorage.setItem("refresh_token", refresh_token);
          }

          return token;
        })
        .catch(() => {
          api.dispatch(logoutThunk());
          throw new Error("Refresh failed");
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    try {
      /* ⏳ Wait for refresh to complete */
      await refreshPromise;

      /* 🔁 Retry original request */
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      return result;
    }
  }

  return result;
};
