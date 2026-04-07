// PATH: src/services/authService.ts
// FIX: /app/profile → /me  (new v1.php ke routes se match karo)
//      /app/logout  → /logout

import api from "../core/api/axios";

export const loginService = (email: string, password: string) => {
  return api.post("/login", { email, password });
};

// ✅ FIX: was /app/profile → now /me
export const profileService = () => {
  return api.get("/me");
};

// ✅ FIX: was /app/logout → now /logout
export const logoutService = () => {
  return api.post("/logout");
};

export const registerService = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  return api.post("/register", data);
};