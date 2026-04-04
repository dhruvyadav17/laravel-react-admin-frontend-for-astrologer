// PATH: src/constants/rbac.ts  UPDATE
// CHANGES: PERMISSIONS.ASTROLOGER group add kiya, ROLES constant add kiya
// REASON: Frontend mein permission strings hardcoded the. Backend config/permissions.php se sync chahiye.

export const PERMISSIONS = {
  USER: {
    VIEW:              'user-view',
    CREATE:            'user-create',
    UPDATE:            'user-update',
    DELETE:            'user-delete',
    RESTORE:           'user-restore',
    ASSIGN_ROLE:       'user-assign-role',
    ASSIGN_PERMISSION: 'user-assign-permission',
  },
  // NEW: synced with config/permissions.php astrologer group
  ASTROLOGER: {
    VIEW:    'astrologer-view',
    CREATE:  'astrologer-create',
    UPDATE:  'astrologer-update',
    DELETE:  'astrologer-delete',
    RESTORE: 'astrologer-restore',
    VERIFY:  'astrologer-verify',
  },
  ROLE:       { MANAGE: 'role-manage' },
  PERMISSION: { MANAGE: 'permission-manage' },
  DASHBOARD:  { VIEW:   'dashboard-view' },
} as const;

// NEW: Role constants to avoid magic strings
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN:       'admin',
  MANAGER:     'manager',
  ASTROLOGER:  'astrologer',
  USER:        'user',
} as const;