// PATH: src/api/axios.ts
// FIX BUG-15: 403 handler hamesha /admin/unauthorized bhejta tha
//              User-side 403 (e.g. /profile access) → /unauthorized chahiye
//              Admin-side 403 → /admin/unauthorized
//              Ab currentPath check karke context-aware redirect karta hai

import axios, { AxiosError } from "axios";
import { getStore }          from "../store/storeAccessor";
import { logoutThunk }       from "../store/authSlice";

/* =====================================================
   AXIOS INSTANCE
   - Used ONLY for: login, register, forgot/reset password
   - Refresh token is handled in RTK Query baseQueryWithReauth
===================================================== */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

/* ── Request interceptor — attach token ─────────── */
api.interceptors.request.use((config) => {
  try {
    const store = getStore();
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // store not ready (early boot)
  }
  return config;
});

/* ── Response interceptor ───────────────────────── */
api.interceptors.response.use(
  (res) => res,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    /* 401 → force logout (axios never refreshes — RTK handles that) */
    if (status === 401) {
      forceLogout();
    }

    /* FIX BUG-15: 403 → context-aware redirect
       Before: always → /admin/unauthorized (wrong for user side)
       After:  admin path → /admin/unauthorized
               user path  → /unauthorized                          */
    if (status === 403) {
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith("/admin");

      const unauthorizedPath = isAdminRoute
        ? "/admin/unauthorized"
        : "/unauthorized";

      if (!currentPath.includes("unauthorized")) {
        window.location.replace(unauthorizedPath);
      }
    }

    return Promise.reject(error);
  }
);

/* ── Force logout helper ────────────────────────── */
function forceLogout() {
  try {
    const store = getStore();
    store.dispatch(logoutThunk());
  } catch {
    // store may not be ready
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");

  const currentPath = window.location.pathname;
  const redirectTo  = currentPath.startsWith("/admin")
    ? "/admin/login"
    : "/login";

  window.location.replace(redirectTo);
}

export default api;
