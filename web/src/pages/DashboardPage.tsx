import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { StatusBadge } from '../components/StatusBadge'

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function DashboardPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [fundAmount, setFundAmount] = useState('5000')
  const [error, setError] = useState<string | null>(null)

  const walletQuery = useQuery({
    queryKey: ['wallet', user?.userId],
    queryFn: () => api.getWallet(user!.userId),
    enabled: Boolean(user?.userId),
    retry: false,
  })

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.listPayments(),
    refetchInterval: 2000,
  })

  const createWallet = useMutation({
    mutationFn: () =>
      api.createWallet(user!.userId, Number(fundAmount) || 5000, 'BRL'),
    onSuccess: () => {
      setError(null)
      void qc.invalidateQueries({ queryKey: ['wallet', user?.userId] })
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Could not create wallet')
    },
  })

  const walletMissing =
    walletQuery.isError &&
    walletQuery.error instanceof ApiError &&
    walletQuery.error.status === 404

  function onFund(e: FormEvent) {
    e.preventDefault()
    createWallet.mutate()
  }

  const recent = (paymentsQuery.data ?? []).slice(0, 5)

  return (
    <div className="stack">
      <div className="section-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted" style={{ margin: '0.35rem 0 0' }}>
            Your wallet and the latest saga outcomes.
          </p>
        </div>
        <Link className="btn btn-primary btn-sm" to="/payments" style={{ width: 'auto' }}>
          Send payment
        </Link>
      </div>

      <div className="grid-2">
        <section className="card-soft">
          <h3>Available balance</h3>
          {walletQuery.isLoading && <p className="muted">Loading wallet…</p>}
          {walletMissing && (
            <form onSubmit={onFund} className="stack" style={{ marginTop: '0.75rem' }}>
              <p className="muted">
                No wallet yet. Create one with demo funds (BRL) to start paying.
              </p>
              {error && <div className="error">{error}</div>}
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="fund">Initial balance</label>
                <input
                  id="fund"
                  type="number"
                  min={0}
                  step="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={createWallet.isPending}
              >
                {createWallet.isPending ? 'Creating…' : 'Create wallet'}
              </button>
            </form>
          )}
          {walletQuery.data && (
            <>
              <p className="metric">
                {formatMoney(walletQuery.data.availableBalance, walletQuery.data.currency)}
              </p>
              <p className="muted">
                Reserved:{' '}
                {formatMoney(walletQuery.data.reservedBalance, walletQuery.data.currency)} ·
                Total: {formatMoney(walletQuery.data.balance, walletQuery.data.currency)}
              </p>
            </>
          )}
        </section>

        <section className="card-soft">
          <h3>Your user id</h3>
          <p className="muted">
            Share this UUID with a second FinFlow account to receive payments.
          </p>
          <p className="mono" style={{ marginTop: '0.75rem', wordBreak: 'break-all' }}>
            {user?.userId}
          </p>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            style={{ marginTop: '0.75rem' }}
            onClick={() => void navigator.clipboard.writeText(user?.userId ?? '')}
          >
            Copy user id
          </button>
        </section>
      </div>

      <section className="card-soft">
        <div className="section-head" style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Recent payments</h3>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Auto-refreshes every 2s
          </span>
        </div>
        {paymentsQuery.isLoading && <p className="muted">Loading…</p>}
        {!paymentsQuery.isLoading && recent.length === 0 && (
          <p className="muted">No payments yet. Send one to watch fraud review live.</p>
        )}
        {recent.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Status</th>
                <th>Payee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td>{formatMoney(p.amount, p.currency)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="mono">{p.payeeId.slice(0, 8)}…</td>
                  <td className="muted">{new Date(p.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
