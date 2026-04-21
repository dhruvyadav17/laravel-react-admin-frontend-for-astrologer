/**
 * WalletPage — User wallet with Razorpay payment integration.
 *
 * SETUP RAZORPAY:
 * 1. Create account at razorpay.com → get API keys
 * 2. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env
 * 3. Real payments will work automatically
 *
 * Demo mode: If keys not configured, wallet is credited directly (no payment).
 */
import { useState, useCallback } from 'react';
import {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useRechargeWalletMutation,
} from '../../../../store/wallet.api';
import { toast } from 'react-toastify';

const RECHARGE_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const TX_COLORS: Record<string, string> = {
  credit: '#16a34a', debit: '#dc2626', refund: '#0284c7',
};
const TX_ICONS: Record<string, string> = {
  credit: 'fa-plus-circle', debit: 'fa-minus-circle', refund: 'fa-undo',
};
const TX_BG: Record<string, string> = {
  credit: 'rgba(34,197,94,.10)', debit: 'rgba(239,68,68,.10)', refund: 'rgba(14,165,233,.10)',
};

declare global {
  interface Window { Razorpay: any; }
}

export default function WalletPage() {
  const [customAmount, setCustomAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [paying, setPaying] = useState(false);

  const { data: wallet, isLoading: loadingWallet } = useGetWalletQuery();
  const { data: txData, isLoading: loadingTx }     = useGetWalletTransactionsQuery();
  const [createOrder]  = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [demoRecharge] = useRechargeWalletMutation(); // fallback demo

  const transactions = txData?.data ?? [];

  // ── Load Razorpay script dynamically ─────────────
  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ── Main payment handler ──────────────────────────
  const handleRecharge = useCallback(async (amount: number) => {
    if (amount < 50) { toast.error('Minimum recharge amount is ₹50'); return; }
    setPaying(true);

    try {
      // Step 1: Create order on backend
      const order = await createOrder({ amount }).unwrap();

      // Demo mode — no real payment needed
      if (order.demo_mode || !order.key_id) {
        await demoRecharge({ amount }).unwrap();
        toast.success(`✅ ₹${amount} added to wallet! (Demo mode)`);
        setCustomAmount('');
        setPaying(false);
        return;
      }

      // Step 2: Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Could not load payment gateway. Check your internet connection.');
        setPaying(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key:         order.key_id,
        amount:      order.amount,        // in paise
        currency:    order.currency,
        name:        'AstroPortal',
        description: `Wallet Recharge ₹${amount}`,
        order_id:    order.order_id,
        image:       '/favicon.ico',
        prefill: {
          name:  '',   // will be filled from user profile in production
          email: '',
        },
        theme: { color: '#e63946' },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.info('Payment cancelled');
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify payment on backend
          try {
            const result = await verifyPayment({
              ...response,
              amount,
            }).unwrap();
            toast.success(`✅ Payment successful! ₹${amount} added to wallet. New balance: ₹${result.balance.toFixed(2)}`);
            setCustomAmount('');
          } catch (err: any) {
            toast.error(err?.data?.message ?? 'Payment verification failed. Contact support.');
          } finally {
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPaying(false);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to initiate payment. Try again.');
      setPaying(false);
    }
  }, [createOrder, verifyPayment, demoRecharge]);

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>

      {/* Balance card */}
      <div className="mb-4 rounded-4 shadow-sm" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px',
      }}>
        <div className="text-white">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="mb-1 opacity-75 small fw-semibold">CURRENT BALANCE</p>
              <h2 className="fw-bold mb-0">
                {loadingWallet
                  ? <span className="spinner-border spinner-border-sm" />
                  : `₹${(wallet?.balance ?? 0).toFixed(2)}`}
              </h2>
            </div>
            <i className="fas fa-wallet fa-2x opacity-50" />
          </div>
          <div className="row mt-3 pt-3 border-top border-white border-opacity-25">
            <div className="col-6 text-center">
              <div className="opacity-75 small">Total Recharged</div>
              <div className="fw-bold">₹{(wallet?.total_recharged ?? 0).toFixed(0)}</div>
            </div>
            <div className="col-6 text-center">
              <div className="opacity-75 small">Total Spent</div>
              <div className="fw-bold">₹{(wallet?.total_spent ?? 0).toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'recharge' ? 'active' : ''}`}
            onClick={() => setActiveTab('recharge')}>
            <i className="fas fa-plus-circle me-2" />Add Money
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}>
            <i className="fas fa-history me-2" />Transactions
            {transactions.length > 0 && (
              <span className="ms-1" style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                fontSize: 11, fontWeight: 600, background: 'rgba(100,116,139,.15)',
                color: '#475569', border: '1px solid rgba(100,116,139,.25)',
              }}>
                {transactions.length}
              </span>
            )}
          </button>
        </li>
      </ul>

      {/* Recharge tab */}
      {activeTab === 'recharge' && (
        <div>
          <p className="t-muted small mb-3 fw-semibold">Quick recharge amounts:</p>

          <div className="row g-2 mb-4">
            {RECHARGE_AMOUNTS.map(amt => (
              <div key={amt} className="col-4 col-md-2">
                <button
                  className="btn btn-outline-primary w-100 py-2 fw-semibold"
                  onClick={() => handleRecharge(amt)}
                  disabled={paying}>
                  ₹{amt}
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 mt-3 mb-4">
            <input type="number" className="form-control"
              placeholder="Custom amount (min ₹50)"
              value={customAmount} min={50} max={50000}
              onChange={e => setCustomAmount(e.target.value)} />
            <button className="btn btn-primary px-4 fw-semibold text-nowrap"
              disabled={paying || !customAmount || parseFloat(customAmount) < 50}
              onClick={() => handleRecharge(parseFloat(customAmount))}>
              {paying
                ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                : <><i className="fas fa-credit-card me-2" />Pay Now</>}
            </button>
          </div>

          {/* Payment methods */}
          <div className="app-card p-3 mb-3">
            <p className="fw-semibold small mb-3 t-main">
              <i className="fas fa-shield-alt me-2 text-success" />Secure Payment Methods
            </p>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              {[
                { icon: 'fa-credit-card', label: 'Cards',   color: '#1a56db' },
                { icon: 'fa-mobile-alt',  label: 'UPI',     color: '#059669' },
                { icon: 'fa-university',  label: 'Net Banking', color: '#7c3aed' },
                { icon: 'fa-wallet',      label: 'Wallets', color: '#d97706' },
              ].map(({ icon, label, color }) => (
                <div key={label} className="d-flex align-items-center gap-2">
                  <div className="rounded d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32, background: `${color}15` }}>
                    <i className={`fas ${icon}`} style={{ color, fontSize: 14 }} />
                  </div>
                  <span className="small t-muted">{label}</span>
                </div>
              ))}
            </div>
            <p className="t-muted mb-0 mt-3" style={{ fontSize: 11 }}>
              <i className="fas fa-lock me-1" />
              Secured by Razorpay · 256-bit SSL · PCI DSS Compliant
            </p>
          </div>

          {/* Demo mode notice (only shown when keys not configured) */}
          <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 small"
            style={{ background: 'rgba(14,165,233,.10)', border: '1px solid rgba(14,165,233,.3)', color: '#0284c7' }}>
            <i className="fas fa-info-circle mt-1 flex-shrink-0" />
            <span>
              <strong>Demo Mode:</strong> Set <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in backend <code>.env</code> to enable real payments.
              In demo mode, wallet is credited directly without payment.
            </span>
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div>
          {loadingTx ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5 t-muted">
              <i className="fas fa-receipt fa-3x d-block mb-3 opacity-25" />
              <p className="fw-semibold">No transactions yet</p>
              <p className="small">Recharge your wallet or book a consultation</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {transactions.map((tx: any) => {
                const color = TX_COLORS[tx.type] ?? '#475569';
                const icon  = TX_ICONS[tx.type]  ?? 'fa-circle';
                const bg    = TX_BG[tx.type]     ?? 'rgba(100,116,139,.10)';
                const sign  = tx.type === 'debit' ? '-' : '+';

                return (
                  <div key={tx.id} className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{ background: 'var(--surf2)', border: '1px solid var(--bdr)' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ background: bg, width: 40, height: 40 }}>
                      <i className={`fas ${icon}`} style={{ color, fontSize: 15 }} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold small t-main">{tx.description}</div>
                      <div className="t-muted" style={{ fontSize: 11 }}>{tx.created_at}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ color }}>
                        {sign}₹{tx.amount.toFixed(2)}
                      </div>
                      <div className="t-muted" style={{ fontSize: 11 }}>
                        Bal: ₹{tx.balance_after.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
