// PATH: src/store/api/baseApi.ts  UPDATE
// CHANGE: tagTypes mein Review, MyAstrologerProfile, MySchedule add kiye
// REASON: New endpoints ke cache invalidation kaam nahi karta tha — tags register nahi the

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQueryWithReauth';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery:   baseQueryWithReauth,

  tagTypes: [
    'User',
    'Astrologer',
    'Review',              // NEW
    'Role',
    'Permission',
    'Sidebar',
    'Dashboard',
    'MyAstrologerProfile', // NEW
    'MySchedule',          // NEW
  ],

  endpoints: () => ({}),
});