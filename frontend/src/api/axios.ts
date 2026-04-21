import axios, { AxiosError } from 'axios';
import type { AppDispatch, RootState } from '../store';
import { getStore } from '../store/storeAccessor';
import { logoutThunk } from '../store/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const store = getStore() as { getState: () => RootState };
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // store not ready at boot
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (status === 401) {
      forceLogout();
    }

    if (status === 403) {
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith('/admin');
      const unauthorizedPath = isAdminRoute ? '/admin/unauthorized' : '/unauthorized';

      if (!currentPath.includes('unauthorized')) {
        window.location.replace(unauthorizedPath);
      }
    }

    return Promise.reject(error);
  }
);

function forceLogout() {
  try {
    const store = getStore() as { dispatch: AppDispatch };
    store.dispatch(logoutThunk());
  } catch {
    // store may not be ready
  }

  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('permissions');

  const currentPath = window.location.pathname;
  const redirectTo = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
  window.location.replace(redirectTo);
}

export default api;
