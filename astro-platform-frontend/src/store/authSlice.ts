// src/store/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { loginService, profileService } from "../services/authService";

import type { User } from "../types/models";
import { emitLogoutEvent } from "../utils/authEvents";

/* =====================================================
   TYPES
===================================================== */

export type AuthState = {
  user: User | null;
  permissions: string[];
  token: string | null;
  loading: boolean;
};

/* =====================================================
   INITIAL STATE
   - Safe rehydration
   - No business logic here
===================================================== */

const initialState: AuthState = {
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })(),

  permissions: (() => {
    try {
      return JSON.parse(localStorage.getItem("permissions") || "[]");
    } catch {
      return [];
    }
  })(),

  token: localStorage.getItem("token"),
  loading: false,
};

/* =====================================================
   THUNKS
===================================================== */

/**
 * LOGIN
 * -------------------------------------------------
 * - Auth only
 * - Tokens handled here
 * - Profile fetched separately
 */
export const loginThunk = createAsyncThunk<
  { token: string; refresh_token?: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await loginService(data.email, data.password);
    return res.data.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || "Invalid credentials");
  }
});

/**
 * PROFILE
 * -------------------------------------------------
 * - SINGLE SOURCE OF TRUTH
 * - user + permissions only
 */
export const fetchProfileThunk = createAsyncThunk<
  { user: User; permissions: string[] },
  void,
  { rejectValue: string }
>("auth/profile", async (_, { rejectWithValue }) => {
  try {
    const res = await profileService();
    return res.data.data;
  } catch {
    return rejectWithValue("Failed to load profile");
  }
});

/**
 * LOGOUT
 * -------------------------------------------------
 * - Clear state
 * - Clear storage
 * - Multi-tab sync
 */
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
  emitLogoutEvent();
  return true;
});

/* =====================================================
   SLICE
===================================================== */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    /**
     * OPTIONAL
     * Manual permission override (rare / admin only)
     */
    setPermissions(state, action: PayloadAction<string[]>) {
      state.permissions = action.payload;
      localStorage.setItem("permissions", JSON.stringify(action.payload));
    },
  },

  extraReducers: (builder) => {
    builder
      /* ================= LOGIN ================= */

      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);

        if (action.payload.refresh_token) {
          localStorage.setItem("refresh_token", action.payload.refresh_token);
        }
      })

      .addCase(loginThunk.rejected, (state) => {
        state.loading = false;
      })

      /* ================= PROFILE ================= */

      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;

        localStorage.setItem("user", JSON.stringify(action.payload.user));

        localStorage.setItem(
          "permissions",
          JSON.stringify(action.payload.permissions),
        );
      })

      .addCase(fetchProfileThunk.rejected, (state) => {
        state.user = null;
        state.permissions = [];
      })

      /* ================= LOGOUT ================= */

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.permissions = [];
        state.token = null;
        state.loading = false;
      });
  },
});

/* =====================================================
   EXPORTS
===================================================== */

export const { setPermissions } = authSlice.actions;
export default authSlice.reducer;
