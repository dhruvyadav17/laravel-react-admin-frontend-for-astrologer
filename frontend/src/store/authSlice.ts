import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { loginService, profileService } from '../modules/auth/services/authService';
import type { User } from '../types/models';

export type AuthState = {
  user:        User | null;
  permissions: string[];
  token:       string | null;
  loading:     boolean;
};

function safeParseLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const initialState: AuthState = {
  user:        safeParseLS<User | null>('user', null),
  permissions: safeParseLS<string[]>('permissions', []).filter((p): p is string => typeof p === 'string'),
  token:       localStorage.getItem('token'),
  loading:     false,
};

export const loginThunk = createAsyncThunk<
  { token: string; refresh_token?: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res     = await loginService(data.email, data.password);
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
    const res     = await profileService();
    const payload = res?.data?.data;
    if (!payload?.user) return rejectWithValue('Invalid profile response');
    return payload;
  } catch {
    return rejectWithValue('Failed to load profile');
  }
});

// Clears local auth state. Does NOT emit cross-tab events — that is handled
// by baseQueryWithReauth when a session expires.
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  ['token', 'refresh_token', 'user', 'permissions'].forEach(k => localStorage.removeItem(k));
  return true;
});

function persistAuth(state: AuthState) {
  localStorage.setItem('user', JSON.stringify(state.user));
  localStorage.setItem('permissions', JSON.stringify(state.permissions));
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPermissions(state, { payload }: PayloadAction<string[]>) {
      state.permissions = payload;
      localStorage.setItem('permissions', JSON.stringify(payload));
    },
    setToken(state, { payload }: PayloadAction<string>) {
      state.token = payload;
      localStorage.setItem('token', payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,  (state) => { state.loading = true; })
      .addCase(loginThunk.rejected, (state) => { state.loading = false; })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.token   = payload.token;
        localStorage.setItem('token', payload.token);
        if (payload.refresh_token) localStorage.setItem('refresh_token', payload.refresh_token);
      })
      .addCase(fetchProfileThunk.fulfilled, (state, { payload }) => {
        state.user        = payload.user;
        state.permissions = payload.permissions;
        persistAuth(state);
      })
      .addCase(fetchProfileThunk.rejected, (state) => {
        state.user        = null;
        state.permissions = [];
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user        = null;
        state.permissions = [];
        state.token       = null;
        state.loading     = false;
      });
  },
});

export const { setPermissions, setToken } = authSlice.actions;
export default authSlice.reducer;
