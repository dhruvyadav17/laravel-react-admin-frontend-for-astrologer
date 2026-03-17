import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logoutThunk } from "../../store/authSlice";
import { logoutService } from "../../services/authService";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async (redirectTo: string = "/admin/login") => {
    // 1️⃣ clear frontend auth
    dispatch(logoutThunk());

    // 2️⃣ redirect immediately
    navigate(redirectTo, { replace: true });

    // 3️⃣ backend logout (best effort)
    try {
      await logoutService();
    } catch {
      // ignore
    }
  };
}
