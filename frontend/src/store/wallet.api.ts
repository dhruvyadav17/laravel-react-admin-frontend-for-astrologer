import { baseApi } from './baseApi';

export interface WalletSummary {
  balance:         number;
  total_recharged: number;
  total_spent:     number;
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
  endpoints: (b) => ({

    getWallet: b.query<WalletSummary, void>({
      query: () => '/wallet',
      transformResponse: (res: any): WalletSummary => res.data,
      providesTags: ['Wallet'],
    }),

    rechargeWallet: b.mutation<{ balance: number; added: number }, { amount: number }>({
      query: (body) => ({ url: '/wallet/recharge', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['Wallet'],
    }),

    getWalletTransactions: b.query<{ data: WalletTx[]; pagination: any }, void>({
      query: () => '/wallet/transactions',
      transformResponse: (res: any) => ({
        data:       res.data ?? [],
        pagination: res.pagination ?? null,   // FIX FE-E: ApiResponse merges meta at top level
      }),
      providesTags: ['Wallet'],
    }),

    createPaymentOrder: b.mutation<{
      order_id: string; amount: number; currency: string;
      key_id: string | null; demo_mode: boolean;
    }, { amount: number }>({
      query: (body) => ({ url: '/payment/create-order', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
    }),

    verifyPayment: b.mutation<{ balance: number; added: number }, {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      amount: number;
    }>({
      query: (body) => ({ url: '/payment/verify', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['Wallet'],
    }),

  }),
});

export const {
  useGetWalletQuery,
  useRechargeWalletMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetWalletTransactionsQuery,
} = walletApi;
