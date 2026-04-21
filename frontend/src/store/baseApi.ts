import { createApi }           from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

// All RTK Query tags used across the app.
// Adding a new tag: add it here, then use it in the relevant api slice.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery:   baseQueryWithReauth,
  tagTypes: [
    'User', 'Astrologer', 'Review',
    'Role', 'Permission',
    'Sidebar', 'Dashboard',
    'MyAstrologerProfile', 'MySchedule',
    'Consultation', 'ChatMessage',
    'Notification', 'Wallet', 'Favorite', 'SiteSettings',
  ],
  endpoints: () => ({}),
});
