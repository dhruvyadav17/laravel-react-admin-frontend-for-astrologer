import { baseApi } from './baseApi';

// API response shape from GET /favorites
export interface FavoriteIds {
  ids: number[];
}

const favoriteApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // Returns { ids: number[] } — list of astrologer IDs the user has favorited
    getFavorites: b.query<FavoriteIds, void>({
      query: () => '/favorites',
      transformResponse: (res: any): FavoriteIds => res.data ?? { ids: [] },
      providesTags: ['Favorite'],
    }),

    toggleFavorite: b.mutation<{ is_favorite: boolean; action: string; astrologer_id: number }, number>({
      query: (id) => ({ url: `/favorites/${id}`, method: 'POST' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['Favorite'],
    }),

  }),
});

export const {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} = favoriteApi;
