// src/services/authService.ts

import api from "../api/axios";

/* =====================================================
   AUTH SERVICES
===================================================== */

/* ================= LOGIN ================= */
/**
 * POST /login
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
 * GET /app/profile
 *
 * 🔥 FIXED: correct route prefix
 */
export const profileService = () => {
  return api.get("/app/profile");
};

/* ================= LOGOUT ================= */
/**
 * POST /app/logout
 *
 * 🔥 FIXED: correct route prefix
 */
export const logoutService = () => {
  return api.post("/app/logout");
};

/* ================= REGISTER ================= */
/**
 * POST /register
 */
export const registerService = (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  return api.post("/register", data);
};