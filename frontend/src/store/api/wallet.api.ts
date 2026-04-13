/**
 * Wallet API -- RTK Query endpoints
 *
 * Handles balance fetch, recharge, and transaction history.
 * The wallet is pre-paid: users must recharge before booking a session.
 *
 * PAYMENT GATEWAY INTEGRATION
 * ----------------------------
 * To integrate Razorpay / Stripe:
 * 1. Add a createOrder mutation -> POST /wallet/order (returns order_id).
 * 2. Open the payment gateway modal with order_id.
 * 3. On gateway success callback, call verifyPayment mutation
 *    -> POST /wallet/verify (backend confirms + credits wallet).
 * 4. Invalidate "Wallet" tag to refresh balance display.
 */
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
