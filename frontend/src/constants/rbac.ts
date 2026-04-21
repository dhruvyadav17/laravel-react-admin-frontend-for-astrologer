// Permission and role string constants — kept in sync with config/permissions.php.
// Use these instead of hardcoded strings to catch typos at compile time.

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

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN:       'admin',
  MANAGER:     'manager',
  ASTROLOGER:  'astrologer',
  USER:        'user',
} as const;
