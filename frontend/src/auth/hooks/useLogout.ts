import type { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { logoutThunk } from '../../store/authSlice';
import { logoutService } from '../../services/authService';

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return async (redirectTo: string = '/admin/login') => {
    dispatch(logoutThunk());
    navigate(redirectTo, { replace: true });

    try {
      await logoutService();
    } catch {
      // ignore backend logout failures after local logout
    }
  };
}
