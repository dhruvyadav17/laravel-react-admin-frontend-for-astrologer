/* ===================================================== */
/* ================= ROLES ============================= */
/* ===================================================== */

export const ADMIN_ROLES = [
  "super-admin",
  "admin",
  // future: "manager", "staff"
] as const;

/* ===================================================== */
/* ================= PERMISSIONS ======================= */
/* ===================================================== */

export const PERMISSIONS = {
  USER: {
    VIEW: "user-view",
    CREATE: "user-create",
    DELETE: "user-delete",
    ASSIGN_ROLE: "user-assign-role",
    ASSIGN_PERMISSION: "user-assign-permission",
  },

  ROLE: {
    MANAGE: "role-manage",
  },

  PERMISSION: {
    MANAGE: "permission-manage",
  },
} as const;

/* ===================================================== */
/* ================= TYPES ============================= */
/* ===================================================== */

type PermissionGroup =
  typeof PERMISSIONS[keyof typeof PERMISSIONS];

export type Permission =
  PermissionGroup[keyof PermissionGroup];
