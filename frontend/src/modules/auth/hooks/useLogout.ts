// Handles user-initiated logout: clears local state, navigates, then calls backend.
// For session-expiry logout see: store/baseQueryWithReauth.ts
import { useDispatch }  from 'react-redux';
import { useNavigate }  from 'react-router-dom';
import type { AppDispatch } from '../../../store';
import { logoutThunk }  from '../../../store/authSlice';
import { logoutService } from '../services/authService';

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return async (redirectTo = '/login') => {
    dispatch(logoutThunk());      // clear Redux + localStorage immediately
    navigate(redirectTo, { replace: true });

    try { await logoutService(); } catch { /* backend failure is non-critical */ }
  };
}
