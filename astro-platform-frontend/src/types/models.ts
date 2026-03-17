// src/types/models.ts

/* =====================================================
   COMMON
===================================================== */

export type ID = number;
export type Timestamp = string;

/* =====================================================
   USER
   -----------------------------------------------------
   Matches:
   - App\Http\Resources\UserResource
   - /profile response
   - /admin/users listing
===================================================== */

export type User = {
  id: ID;
  name: string;
  email: string;

  /* ================= RBAC ================= */
  roles: string[];                 // ["super-admin", "admin"]

  /* ================= ACCOUNT ================= */
  is_active?: boolean;
  force_password_reset?: boolean;

  /* ================= VERIFICATION ================= */
  email_verified_at?: Timestamp | null;

  /* ================= SECURITY ================= */
  last_login_at?: Timestamp | null;
  last_login_ip?: string | null;

  /* ================= SOFT DELETE ================= */
  deleted_at?: Timestamp | null;

  /* ================= META ================= */
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

/* =====================================================
   ROLE
===================================================== */

export type Role = {
  id: ID;
  name: string;

  is_active?: boolean;
  deleted_at?: Timestamp | null;
};

/* =====================================================
   PERMISSION
===================================================== */

export type Permission = {
  id: ID;
  name: string;

  is_active?: boolean;
  deleted_at?: Timestamp | null;
};
