import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError, api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function WalletPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [fundAmount, setFundAmount] = useState('5000')
  const [error, setError] = useState<string | null>(null)

  const walletQuery = useQuery({
    queryKey: ['wallet', user?.userId],
    queryFn: () => api.getWallet(user!.userId),
    enabled: Boolean(user?.userId),
    retry: false,
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

  return (
    <div className="stack">
      <div className="section-head">
        <div>
          <h2>Wallet</h2>
          <p className="muted" style={{ margin: '0.35rem 0 0' }}>
            Pessimistic locking protects balance during reserve / settle / release.
          </p>
        </div>
      </div>

      {walletMissing && (
        <form className="card-soft" onSubmit={onFund}>
          <h3>Open a wallet</h3>
          {error && <div className="error">{error}</div>}
          <div className="field">
            <label htmlFor="initial">Initial balance (BRL)</label>
            <input
              id="initial"
              type="number"
              min={0}
              step="0.01"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={createWallet.isPending}>
            {createWallet.isPending ? 'Creating…' : 'Create wallet'}
          </button>
        </form>
      )}

      {walletQuery.data && (
        <div className="grid-2">
          <section className="card-soft">
            <h3>Available</h3>
            <p className="metric">
              {formatMoney(walletQuery.data.availableBalance, walletQuery.data.currency)}
            </p>
            <p className="muted">balance − reserved</p>
          </section>
          <section className="card-soft">
            <h3>Reserved (in-flight)</h3>
            <p className="metric">
              {formatMoney(walletQuery.data.reservedBalance, walletQuery.data.currency)}
            </p>
            <p className="muted">Held while fraud review runs</p>
          </section>
          <section className="card-soft">
            <h3>Ledger total</h3>
            <p className="metric">
              {formatMoney(walletQuery.data.balance, walletQuery.data.currency)}
            </p>
            <p className="muted">Wallet id: {walletQuery.data.id.slice(0, 8)}…</p>
          </section>
          <section className="card-soft">
            <h3>How locking works</h3>
            <p className="muted">
              On payment create, wallet-service runs <code>SELECT FOR UPDATE</code>, reserves
              funds, then settles or releases after the fraud Kafka result — no double spend
              under concurrent requests.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
