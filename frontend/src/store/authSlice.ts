import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { loginService, profileService } from '../services/authService';
import type { User } from '../types/models';
import { emitLogoutEvent } from '../utils/authEvents';

export type AuthState = {
  user: User | null;
  permissions: string[];
  token: string | null;
  loading: boolean;
};

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const initialState: AuthState = {
  user: safeParse<User | null>('user', null),
  permissions: safeParse<string[]>('permissions', []).filter((p): p is string => typeof p === 'string'),
  token: localStorage.getItem('token'),
  loading: false,
};

export const loginThunk = createAsyncThunk<
  { token: string; refresh_token?: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await loginService(data.email, data.password);
    const payload = res?.data?.data;
    if (!payload?.token) return rejectWithValue('Invalid login response');
    return payload;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message ?? 'Invalid credentials');
  }
});

export const fetchProfileThunk = createAsyncThunk<
  { user: User; permissions: string[] },
  void,
  { rejectValue: string }
>('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const res = await profileService();
    const payload = res?.data?.data;
    if (!payload?.user) return rejectWithValue('Invalid profile response');
    return payload;
  } catch {
    return rejectWithValue('Failed to load profile');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('permissions');
  emitLogoutEvent();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPermissions(state, action: PayloadAction<string[]>) {
      state.permissions = action.payload;
      localStorage.setItem('permissions', JSON.stringify(action.payload));
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload?.token ?? null;
        state.token = token;
        if (token) localStorage.setItem('token', token);
        if (action.payload?.refresh_token) {
          localStorage.setItem('refresh_token', action.payload.refresh_token);
        }
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null;
        state.permissions = action.payload?.permissions ?? [];
        localStorage.setItem('user', JSON.stringify(state.user));
        localStorage.setItem('permissions', JSON.stringify(state.permissions));
      })
      .addCase(fetchProfileThunk.rejected, (state) => {
        state.user = null;
        state.permissions = [];
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.permissions = [];
        state.token = null;
        state.loading = false;
      });
  },
});

export const { setPermissions, setToken } = authSlice.actions;
export default authSlice.reducer;
