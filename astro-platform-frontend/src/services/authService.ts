// src/services/authService.ts

import api from "../api/axios";

/* =====================================================
   AUTH SERVICES
   -----------------------------------------------------
   RULES:
   - ONLY authentication related endpoints
   - No token mutation here
   - No refresh-token logic here
   - No admin APIs here
===================================================== */

/* ================= LOGIN ================= */
/**
 * POST /login
 *
 * Returns:
 * {
 *   token: string
 *   refresh_token?: string
 * }
 */
export const loginService = (
  email: string,
  password: string
) => {
  return api.post("/login", {
    email,
    password,
  });
};

/* ================= PROFILE ================= */
/**
 * GET /profile
 *
 * SINGLE SOURCE OF TRUTH
 * {
 *   user: User
 *   permissions: string[]
 * }
 */
export const profileService = () => {
  return api.get("/profile");
};

/* ================= LOGOUT ================= */
/**
 * POST /logout
 *
 * Best-effort backend logout
 * (frontend state already cleared)
 */
export const logoutService = () => {
  return api.post("/logout");
};

/* ================= REGISTER ================= */
/**
 * POST /register
 *
 * USER registration only
 * ❌ Admin creation NOT allowed here
 */
export const registerService = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  return api.post("/register", data);
};
