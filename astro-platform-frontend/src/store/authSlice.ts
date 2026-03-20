// src/store/authSlice.ts

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";

import {
  loginService,
  profileService,
} from "../services/authService";

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
   INITIAL STATE (SAFE)
===================================================== */

const initialState: AuthState = {
  user: (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  })(),

  permissions: (() => {
    try {
      return JSON.parse(
        localStorage.getItem("permissions") || "[]"
      );
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
 */
export const loginThunk = createAsyncThunk<
  { token: string; refresh_token?: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await loginService(
      data.email,
      data.password
    );

    // 🔥 SAFE ACCESS
    const payload = res?.data?.data;

    if (!payload?.token) {
      return rejectWithValue("Invalid login response");
    }

    return payload;
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message ||
        "Invalid credentials"
    );
  }
});

/**
 * PROFILE
 */
export const fetchProfileThunk = createAsyncThunk<
  { user: User; permissions: string[] },
  void,
  { rejectValue: string }
>("auth/profile", async (_, { rejectWithValue }) => {
  try {
    const res = await profileService();

    const payload = res?.data?.data;

    if (!payload?.user) {
      return rejectWithValue(
        "Invalid profile response"
      );
    }

    return payload;
  } catch {
    return rejectWithValue(
      "Failed to load profile"
    );
  }
});

/**
 * LOGOUT
 */
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");

    emitLogoutEvent();

    return true;
  }
);

/* =====================================================
   SLICE
===================================================== */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setPermissions(
      state,
      action: PayloadAction<string[]>
    ) {
      state.permissions = action.payload;

      localStorage.setItem(
        "permissions",
        JSON.stringify(action.payload)
      );
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= LOGIN ================= */

      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(
        loginThunk.fulfilled,
        (state, action) => {
          state.loading = false;

          const token =
            action.payload?.token ?? null;

          state.token = token;

          if (token) {
            localStorage.setItem("token", token);
          }

          if (action.payload?.refresh_token) {
            localStorage.setItem(
              "refresh_token",
              action.payload.refresh_token
            );
          }
        }
      )

      .addCase(loginThunk.rejected, (state) => {
        state.loading = false;
      })

      /* ================= PROFILE ================= */

      .addCase(
        fetchProfileThunk.fulfilled,
        (state, action) => {
          const user =
            action.payload?.user ?? null;

          const permissions =
            action.payload?.permissions ?? [];

          state.user = user;
          state.permissions = permissions;

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );

          localStorage.setItem(
            "permissions",
            JSON.stringify(permissions)
          );
        }
      )

      .addCase(
        fetchProfileThunk.rejected,
        (state) => {
          state.user = null;
          state.permissions = [];
        }
      )

      /* ================= LOGOUT ================= */

      .addCase(
        logoutThunk.fulfilled,
        (state) => {
          state.user = null;
          state.permissions = [];
          state.token = null;
          state.loading = false;
        }
      );
  },
});

/* =====================================================
   EXPORTS
===================================================== */

export const { setPermissions } =
  authSlice.actions;

export default authSlice.reducer;