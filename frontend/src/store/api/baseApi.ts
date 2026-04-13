// FIX: tagTypes consistent naming -- 'User', 'Role', 'Permission' (not Users/Roles/Permissions)
//   Mismatched tags = cache never invalidated after CRUD operations

import { createApi }           from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQueryWithReauth';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery:   baseQueryWithReauth,

  tagTypes: [
    'User',
    'Astrologer',
    'Review',
    'Role',
    'Permission',
    'Sidebar',
    'Dashboard',
    'MyAstrologerProfile',
    'MySchedule',
    'Consultation',
    'ChatMessage',
    'Notification',
    'Wallet',
    'Favorite',
  ],

  endpoints: () => ({}),
});
