// src/api/axios.ts

import axios, { AxiosError } from "axios";
import { getStore } from "../store/storeAccessor";
import { logoutThunk } from "../store/authSlice";

/* =====================================================
   AXIOS INSTANCE
   -----------------------------------------------------
   - Used ONLY for:
     • login
     • register
     • forgot / reset password
     • email verification
   - Refresh token is NOT handled here
===================================================== */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

/* =====================================================
   REQUEST INTERCEPTOR
   -----------------------------------------------------
   - Attach token if available
===================================================== */

api.interceptors.request.use((config) => {
  try {
    const store = getStore();
    const token = store.getState().auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // store not ready (early boot / edge case)
  }

  return config;
});

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

api.interceptors.response.use(
  (res) => res,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    /* ================= 401 → FORCE LOGOUT ================= */
    if (status === 401) {
      /**
       * 🔒 RULE:
       * - axios NEVER refreshes token
       * - refresh handled only in RTK Query
       *
       * If axios gets 401 → session is invalid
       */
      forceLogout();
    }

    /* ================= 403 → UNAUTHORIZED ================= */
    if (status === 403) {
      if (!window.location.pathname.includes("/admin/unauthorized")) {
        window.location.replace("/admin/unauthorized");
      }
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   HELPERS
===================================================== */

function forceLogout() {
  try {
    const store = getStore();
    store.dispatch(logoutThunk());
  } catch {
    // store may not be ready
  }

  /* 🔥 Clear ONLY auth-related storage */
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");

  /* 🔁 Context-aware redirect */
  const currentPath = window.location.pathname;

  const redirectTo =
    currentPath.startsWith("/admin")
      ? "/admin/login"
      : "/login";

  window.location.replace(redirectTo);
}

export default api;
