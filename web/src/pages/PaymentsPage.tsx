import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent } from 'react'
import { ApiError, api, type PaymentResponse } from '../api/client'
import { PaymentTimeline } from '../components/PaymentTimeline'
import { StatusBadge } from '../components/StatusBadge'

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function newIdempotencyKey() {
  return `pay-${crypto.randomUUID()}`
}

export function PaymentsPage() {
  const qc = useQueryClient()
  const [payeeId, setPayeeId] = useState('')
  const [amount, setAmount] = useState('100')
  const [currency, setCurrency] = useState('BRL')
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.listPayments(),
    refetchInterval: 1500,
  })

  const activePayment = useMemo(
    () => paymentsQuery.data?.find((p) => p.id === activeId) ?? null,
    [paymentsQuery.data, activeId],
  )

  const createPayment = useMutation({
    mutationFn: () =>
      api.createPayment({
        payeeId: payeeId.trim(),
        amount: Number(amount),
        currency,
        idempotencyKey: newIdempotencyKey(),
      }),
    onSuccess: (payment) => {
      setError(null)
      setActiveId(payment.id)
      void qc.invalidateQueries({ queryKey: ['payments'] })
      void qc.invalidateQueries({ queryKey: ['wallet'] })
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Payment failed')
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    createPayment.mutate()
  }

  return (
    <div className="stack">
      <div className="section-head">
        <div>
          <h2>Payments</h2>
          <p className="muted" style={{ margin: '0.35rem 0 0' }}>
            Create a payment and watch status move through the choreography saga.
          </p>
        </div>
      </div>

      <div className="grid-2">
        <form className="card-soft" onSubmit={onSubmit}>
          <h3>Send money</h3>
          <p className="muted">
            Tip: payee must have a wallet. To demo <strong>fraud</strong>, your available balance
            must be <strong>&gt; 50,000</strong> (create a new account with initial balance 60000),
            then send 50001. If balance is lower, you get <strong>Insufficient funds</strong> first —
            fraud never runs.
          </p>
          {error && <div className="error">{error}</div>}

          <div className="field">
            <label htmlFor="payee">Payee user id</label>
            <input
              id="payee"
              required
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              placeholder="uuid of another FinFlow user"
              className="mono"
            />
          </div>

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? 'Submitting…' : 'Create payment'}
          </button>
        </form>

        <section className="card-soft">
          <h3>Live saga view</h3>
          {!activePayment && (
            <p className="muted">Submit a payment to see the async pipeline.</p>
          )}
          {activePayment && (
            <>
              <div className="copy-row" style={{ marginBottom: '0.5rem' }}>
                <StatusBadge status={activePayment.status} />
                <span className="mono muted">{activePayment.id.slice(0, 8)}…</span>
              </div>
              <p className="metric" style={{ fontSize: '1.8rem' }}>
                {formatMoney(activePayment.amount, activePayment.currency)}
              </p>
              {activePayment.rejectionReason && (
                <div className="error" style={{ marginTop: '0.75rem' }}>
                  {activePayment.rejectionReason}
                </div>
              )}
              <PaymentTimeline
                status={activePayment.status}
                rejectionReason={activePayment.rejectionReason}
              />
            </>
          )}
        </section>
      </div>

      <section className="card-soft">
        <h3>History</h3>
        <PaymentTable
          payments={paymentsQuery.data ?? []}
          onSelect={setActiveId}
          activeId={activeId}
        />
      </section>
    </div>
  )
}

function PaymentTable({
  payments,
  onSelect,
  activeId,
}: {
  payments: PaymentResponse[]
  onSelect: (id: string) => void
  activeId: string | null
}) {
  if (payments.length === 0) {
    return <p className="muted">No payments yet.</p>
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Created</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.id} style={{ opacity: activeId === p.id ? 1 : 0.9 }}>
            <td className="mono">{p.id.slice(0, 8)}…</td>
            <td>{formatMoney(p.amount, p.currency)}</td>
            <td>
              <StatusBadge status={p.status} />
            </td>
            <td className="muted">{new Date(p.createdAt).toLocaleString()}</td>
            <td>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => onSelect(p.id)}
              >
                Inspect
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
