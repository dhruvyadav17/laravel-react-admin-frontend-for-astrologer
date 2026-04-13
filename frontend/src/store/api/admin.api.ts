/**
 * Admin API -- RTK Query endpoints
 *
 * All admin CRUD operations: users, astrologers, roles, permissions,
 * dashboard stats, and activity log.
 *
 * ACCESS: All endpoints require the "admin" or "super-admin" role.
 * The AdminGuard route guard enforces this on the frontend.
 *
 * TO ADD A NEW ADMIN MODULE:
 * 1. Create a new admin feature folder under features/admin/.
 * 2. Add the CRUD endpoints here following the existing pattern.
 * 3. Add routes in admin.routes.tsx and menu items in AdminSidebar.tsx.
 * 4. Add backend routes + controller under Api/Admin/.
 */
import { baseApi }  from './baseApi';
import type {
  User, Role, Permission, PaginatedResponse,
} from '../../types/models';

export interface DashboardStats {
  total_users:          number;
  total_astrologers:    number;
  total_consultations:  number;
  online_astrologers:   number;
  revenue:              number;
  revenue_today?:       number;
  revenue_30d?:         number;
  revenue_chart?:       Array<{ date: string; revenue: number }>;
  type_breakdown?:      Record<string, number>;
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

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({

    /* ======= USERS ======= */
    getUsers: builder.query<
      PaginatedResponse<User>,
      { search?: string; page?: number; role?: string } | void
    >({
      query: (params) => ({ url: '/admin/users', params: params ?? {} }),
      transformResponse: (res: any): PaginatedResponse<User> => ({
        data:       res.data ?? [],
        pagination: res.meta?.pagination ?? res.pagination ?? null,
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'User' as const, id })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({ url: '/admin/users', method: 'POST', body: data }),
      transformResponse: (res: any): User => res.data,
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<User, { id: number } & Partial<User>>({
      query: ({ id, ...data }) => ({ url: `/admin/users/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any): User => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    restoreUser: builder.mutation<User, number>({
      query: (id) => ({ url: `/admin/users/${id}/restore`, method: 'PATCH' }),
      transformResponse: (res: any): User => res.data,
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    assignUserRoles: builder.mutation<{ roles: string[] }, { id: number; roles: string[] }>({
      query: ({ id, roles }) => ({ url: `/admin/users/${id}/assign-role`, method: 'POST', body: { roles } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    getUserPermissions: builder.query<{ permissions: Permission[]; assigned: string[] }, number>({
      query: (id) => `/admin/users/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    assignUserPermissions: builder.mutation<{ assigned: string[] }, { id: number; permissions: string[] }>({
      query: ({ id, permissions }) => ({
        url: `/admin/users/${id}/permissions`, method: 'POST', body: { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }],
    }),

    /* ======= ROLES ======= */
    getRoles: builder.query<Role[], void>({
      query: () => '/admin/roles',
      transformResponse: (res: any): Role[] => res.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Role' as const, id })), { type: 'Role', id: 'LIST' }]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    createRole: builder.mutation<Role, Partial<Role>>({
      query: (data) => ({ url: '/admin/roles', method: 'POST', body: data }),
      transformResponse: (res: any): Role => res.data,
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    updateRole: builder.mutation<Role, { id: number } & Partial<Role>>({
      query: ({ id, ...data }) => ({ url: `/admin/roles/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any): Role => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),

    deleteRole: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    getRolePermissions: builder.query<{ permissions: Permission[]; assigned: string[] }, number>({
      query: (id) => `/admin/roles/${id}/permissions`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, id) => [{ type: 'Role', id }],
    }),

    assignRolePermissions: builder.mutation<void, { id: number; permissions: string[] }>({
      query: ({ id, permissions }) => ({
        url: `/admin/roles/${id}/permissions`, method: 'POST', body: { permissions },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),

    /* ======= PERMISSIONS ======= */
    getPermissions: builder.query<Permission[], void>({
      query: () => '/admin/permissions',
      transformResponse: (res: any): Permission[] => res.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Permission' as const, id })), { type: 'Permission', id: 'LIST' }]
          : [{ type: 'Permission', id: 'LIST' }],
    }),

    createPermission: builder.mutation<Permission, Partial<Permission>>({
      query: (data) => ({ url: '/admin/permissions', method: 'POST', body: data }),
      transformResponse: (res: any): Permission => res.data,
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    updatePermission: builder.mutation<Permission, { id: number } & Partial<Permission>>({
      query: ({ id, ...data }) => ({ url: `/admin/permissions/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any): Permission => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Permission', id }, { type: 'Permission', id: 'LIST' }],
    }),

    deletePermission: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/permissions/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    /* ======= SIDEBAR ======= */
    getSidebar: builder.query<any[], void>({
      query: () => '/admin/sidebar',
      transformResponse: (res: any) => res.data ?? [],
      providesTags: ['Sidebar'],
    }),

    /* ======= DASHBOARD ======= */
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/admin/dashboard/stats',
      transformResponse: (res: any): DashboardStats => res.data ?? {},
      providesTags: ['Dashboard'],
    }),

    /* ======= ACTIVITY LOGS ======= */
    getActivityLogs: builder.query<
      { data: ActivityLog[]; pagination: any },
      { page?: number; search?: string; action?: string } | void
    >({
      query: (params) => ({ url: '/admin/activity', params: params ?? {} }),
      transformResponse: (res: any) => ({
        data:       res.data       ?? [],
        pagination: res.meta?.pagination ?? null,
      }),
    }),

  }),
});

/* -- All hooks exported --------------------------------------- */
export const {
  // Users
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useAssignUserRolesMutation,
  useGetUserPermissionsQuery,
  useAssignUserPermissionsMutation,

  // Roles
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useAssignRolePermissionsMutation,

  // Permissions
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,

  // Sidebar + Dashboard
  useGetSidebarQuery,
  useGetDashboardStatsQuery,

  // Activity Logs -- FIX: yeh export missing tha
  useGetActivityLogsQuery,
} = adminApi;
