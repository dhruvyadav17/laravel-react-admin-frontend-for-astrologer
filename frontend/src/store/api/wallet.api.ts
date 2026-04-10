// PATH: src/store/api/wallet.api.ts
import { baseApi } from './baseApi';

export interface WalletSummary {
  balance:          number;
  total_recharged:  number;
  total_spent:      number;
}

export interface WalletTx {
  id:            number;
  type:          'credit' | 'debit' | 'refund';
  amount:        number;
  balance_after: number;
  description:   string;
  status:        string;
  created_at:    string;
}

const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getWallet: build.query<WalletSummary, void>({
      query: () => '/wallet',
      transformResponse: (res: any): WalletSummary => res.data,
      providesTags: ['Wallet' as any],
    }),

    rechargeWallet: build.mutation<{ balance: number; added: number }, { amount: number }>({
      query: (body) => ({ url: '/wallet/recharge', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['Wallet' as any],
    }),

    getWalletTransactions: build.query<{ data: WalletTx[]; pagination: any }, void>({
      query: () => '/wallet/transactions',
      transformResponse: (res: any) => ({
        data:       res.data       ?? [],
        pagination: res.meta?.pagination ?? null,
      }),
      providesTags: ['Wallet' as any],
    }),

  }),
});

export const {
  useGetWalletQuery,
  useRechargeWalletMutation,
  useGetWalletTransactionsQuery,
} = walletApi;
