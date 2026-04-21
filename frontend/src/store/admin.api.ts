import { baseApi } from './baseApi';
import type { User, Role, Permission, PaginatedResponse } from '../types/models';

// To add a new admin module:
// 1. Add endpoints here following the existing CRUD pattern.
// 2. Add lazy-loaded route in modules/admin/routes.tsx.
// 3. Add backend route + controller in routes/api/v1.php.

export interface DashboardStats {
  total_users:         number;
  total_astrologers:   number;
  total_consultations: number;
  online_astrologers:  number;
  revenue:             number;
  revenue_today?:      number;
  revenue_30d?:        number;
  revenue_chart?:      { date: string; revenue: number }[];
  type_breakdown?:     Record<string, number>;
  consultations_today?: number;
}

export interface ActivityLog {
  id:           number;
  action:       string;
  subject_type: string | null;
  subject_id:   number | null;
  ip_address:   string | null;
  created_at:   string;
  user:         { name: string; email: string } | null;
}

// Helper: standard list + individual item cache tags for a given resource type
function listTags<T extends string>(type: T, items: { id: number }[]) {
  return [...items.map(({ id }) => ({ type, id })), { type, id: 'LIST' as const }];
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // ── Users ─────────────────────────────────────────────────────────────

    getUsers: b.query<PaginatedResponse<User>, { search?: string; page?: number; role?: string } | void>({
      query: (params) => ({ url: '/admin/users', params: params ?? {} }),
      transformResponse: (res: any): PaginatedResponse<User> => ({
        data:       res.data ?? [],
        pagination: res.meta?.pagination ?? res.pagination ?? null,
      }),
      providesTags: (result) =>
        result ? listTags('User', result.data) : [{ type: 'User', id: 'LIST' }],
    }),

    createUser: b.mutation<User, Partial<User>>({
      query: (data) => ({ url: '/admin/users', method: 'POST', body: data }),
      transformResponse: (res: any): User => res.data,
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: b.mutation<User, { id: number } & Partial<User>>({
      query: ({ id, ...data }) => ({ url: `/admin/users/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any): User => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    deleteUser: b.mutation<void, number>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    restoreUser: b.mutation<User, number>({
      query: (id) => ({ url: `/admin/users/${id}/restore`, method: 'PATCH' }),
      transformResponse: (res: any): User => res.data,
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    assignUserRoles: b.mutation<{ roles: string[] }, { id: number; roles: string[] }>({
      query: ({ id, roles }) => ({ url: `/admin/users/${id}/assign-role`, method: 'POST', body: { roles } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    getUserPermissions: b.query<{ permissions: Permission[]; assigned: string[] }, number>({
      query: (id) => `/admin/users/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    assignUserPermissions: b.mutation<{ assigned: string[] }, { id: number; permissions: string[] }>({
      query: ({ id, permissions }) => ({
        url: `/admin/users/${id}/permissions`, method: 'POST', body: { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }],
    }),

    // ── Roles ─────────────────────────────────────────────────────────────

    getRoles: b.query<Role[], void>({
      query: () => '/admin/roles',
      transformResponse: (res: any): Role[] => res.data ?? [],
      providesTags: (result) =>
        result ? listTags('Role', result) : [{ type: 'Role', id: 'LIST' }],
    }),

    createRole: b.mutation<Role, Partial<Role>>({
      query: (data) => ({ url: '/admin/roles', method: 'POST', body: data }),
      transformResponse: (res: any): Role => res.data,
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    updateRole: b.mutation<Role, { id: number } & Partial<Role>>({
      query: ({ id, ...data }) => ({ url: `/admin/roles/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any): Role => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),

    deleteRole: b.mutation<void, number>({
      query: (id) => ({ url: `/admin/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    getRolePermissions: b.query<{ permissions: Permission[]; assigned: string[] }, number>({
      query: (id) => `/admin/roles/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Role', id }],
    }),

    assignRolePermissions: b.mutation<void, { id: number; permissions: string[] }>({
      query: ({ id, permissions }) => ({
        url: `/admin/roles/${id}/permissions`, method: 'POST', body: { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),

    // ── Permissions ───────────────────────────────────────────────────────

    getPermissions: b.query<Permission[], void>({
      query: () => '/admin/permissions',
      transformResponse: (res: any): Permission[] => res.data ?? [],
      providesTags: (result) =>
        result ? listTags('Permission', result) : [{ type: 'Permission', id: 'LIST' }],
    }),

    createPermission: b.mutation<Permission, Partial<Permission>>({
      query: (data) => ({ url: '/admin/permissions', method: 'POST', body: data }),
      transformResponse: (res: any): Permission => res.data,
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    updatePermission: b.mutation<Permission, { id: number } & Partial<Permission>>({
      query: ({ id, ...data }) => ({ url: `/admin/permissions/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any): Permission => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Permission', id }, { type: 'Permission', id: 'LIST' }],
    }),

    deletePermission: b.mutation<void, number>({
      query: (id) => ({ url: `/admin/permissions/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    // ── Dashboard / Sidebar / Activity ────────────────────────────────────

    getSidebar: b.query<any[], void>({
      query: () => '/admin/sidebar',
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['Sidebar'],
    }),

    getDashboardStats: b.query<DashboardStats, void>({
      query: () => '/admin/dashboard/stats',
      transformResponse: (res: any): DashboardStats => res.data ?? {},
      providesTags: ['Dashboard'],
    }),

    getActivityLogs: b.query<
      { data: ActivityLog[]; pagination: any },
      { page?: number; search?: string; action?: string } | void
    >({
      query: (params) => ({ url: '/admin/activity', params: params ?? {} }),
      transformResponse: (res: any) => ({
        data:       res.data ?? [],
        pagination: res.pagination ?? null,   // FIX FE-J: ApiResponse merges pagination at top level
      }),
    }),

  }),
});

export const {
  useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation,
  useDeleteUserMutation, useRestoreUserMutation, useAssignUserRolesMutation,
  useGetUserPermissionsQuery, useAssignUserPermissionsMutation,
  useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation,
  useDeleteRoleMutation, useGetRolePermissionsQuery, useAssignRolePermissionsMutation,
  useGetPermissionsQuery, useCreatePermissionMutation, useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetSidebarQuery, useGetDashboardStatsQuery, useGetActivityLogsQuery,
} = adminApi;
