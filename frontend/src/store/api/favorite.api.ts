/**
 * Favorites API -- RTK Query endpoints
 *
 * Toggles and lists favorited astrologers.
 * Favorites are stored server-side in the favorites table
 * (user_id, astrologer_id), so they persist across devices.
 *
 * The useFavorites() hook (hooks/useFavorites.ts) wraps these endpoints
 * and provides isFavorite(id) + toggle(id) helpers to all card components.
 */
import { baseApi } from './baseApi';

const favoriteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getFavorites: build.query<{ ids: number[] }, void>({
      query: () => '/favorites',
      transformResponse: (res: any) => res.data ?? { ids: [] },
      providesTags: ['Favorite' as any],
    }),

    toggleFavorite: build.mutation<{ action: 'added' | 'removed'; astrologer_id: number }, number>({
      query: (id) => ({ url: `/favorites/${id}`, method: 'POST' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['Favorite' as any],
    }),

  }),
});

export const { useGetFavoritesQuery, useToggleFavoriteMutation } = favoriteApi;
