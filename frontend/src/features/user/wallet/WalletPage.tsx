// PATH: src/features/user/wallet/WalletPage.tsx
// User wallet: balance display, recharge, transaction history

import { useState }                from 'react';
import {
  useGetWalletQuery,
  useRechargeWalletMutation,
  useGetWalletTransactionsQuery,
} from '../../../store/api/wallet.api';
import { toast }                   from 'react-toastify';

const RECHARGE_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const TX_COLORS: Record<string, string> = {
  credit: 'success',
  debit:  'danger',
  refund: 'info',
};

const TX_ICONS: Record<string, string> = {
  credit: 'fa-plus-circle',
  debit:  'fa-minus-circle',
  refund: 'fa-undo',
};

export default function WalletPage() {
  const [customAmount, setCustomAmount] = useState('');
  const [activeTab,    setActiveTab]    = useState<'recharge' | 'history'>('recharge');

  const { data: wallet,       isLoading: loadingWallet }  = useGetWalletQuery();
  const { data: txData,       isLoading: loadingTx }      = useGetWalletTransactionsQuery();
  const [recharge, { isLoading: recharging }]             = useRechargeWalletMutation();

  const transactions = txData?.data ?? [];

  const handleRecharge = async (amount: number) => {
    if (amount < 50) { toast.error('Minimum recharge ₹50 hai'); return; }
    try {
      const res = await recharge({ amount }).unwrap();
      toast.success(`₹${amount} wallet mein add ho gaye! New balance: ₹${res.balance}`);
      setCustomAmount('');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Recharge failed');
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>

      {/* Balance card */}
      <div className="card mb-4 border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card-body text-white py-4 px-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="mb-1 opacity-75 small fw-semibold">CURRENT BALANCE</p>
              <h2 className="fw-bold mb-0">
                {loadingWallet
                  ? <span className="spinner-border spinner-border-sm" />
                  : `₹${(wallet?.balance ?? 0).toFixed(2)}`
                }
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
          <button
            className={`nav-link ${activeTab === 'recharge' ? 'active' : ''}`}
            onClick={() => setActiveTab('recharge')}
          >
            <i className="fas fa-plus-circle me-2" />Add Money
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history me-2" />Transactions
            {transactions.length > 0 && (
              <span className="badge bg-secondary ms-1">{transactions.length}</span>
            )}
          </button>
        </li>
      </ul>

      {/* Recharge tab */}
      {activeTab === 'recharge' && (
        <div>
          <p className="text-muted small mb-3">Quick recharge amounts:</p>
          <div className="row g-2 mb-3">
            {RECHARGE_AMOUNTS.map((amt) => (
              <div key={amt} className="col-4 col-md-2">
                <button
                  className="btn btn-outline-primary w-100 py-2 fw-semibold"
                  onClick={() => handleRecharge(amt)}
                  disabled={recharging}
                >
                  ₹{amt}
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 mt-3">
            <input
              type="number"
              className="form-control"
              placeholder="Custom amount (min ₹50)"
              value={customAmount}
              min={50}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
            <button
              className="btn btn-primary px-4 fw-semibold"
              disabled={recharging || !customAmount}
              onClick={() => handleRecharge(parseFloat(customAmount))}
            >
              {recharging
                ? <span className="spinner-border spinner-border-sm" />
                : 'Add Money'
              }
            </button>
          </div>

          <div className="alert alert-info mt-4 py-2 small">
            <i className="fas fa-info-circle me-2" />
            This is a demo wallet. In production, UPI/Card payment gateway integrate hoga.
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div>
          {loadingTx ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-receipt fa-3x d-block mb-3 opacity-25" />
              <p className="fw-semibold">No transactions yet</p>
              <p className="small">Wallet recharge karein ya consultation book karein</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {transactions.map((tx) => {
                const color = TX_COLORS[tx.type] ?? 'secondary';
                const icon  = TX_ICONS[tx.type]  ?? 'fa-circle';
                const sign  = tx.type === 'debit' ? '-' : '+';

                return (
                  <div key={tx.id}
                    className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded-circle bg-${color}-subtle text-${color}
                        d-flex align-items-center justify-content-center`}
                        style={{ width: 36, height: 36 }}>
                        <i className={`fas ${icon}`} style={{ fontSize: 14 }} />
                      </div>
                      <div>
                        <div className="fw-semibold small">{tx.description}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{tx.created_at}</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className={`fw-bold text-${color}`}>
                        {sign}₹{tx.amount.toFixed(2)}
                      </div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
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
