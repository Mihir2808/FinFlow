import type { PaymentStatus } from '../api/client'

const STEPS = [
  { key: 'created', label: 'Payment created' },
  { key: 'reserved', label: 'Wallet balance reserved' },
  { key: 'fraud', label: 'Fraud service analyzing' },
  { key: 'final', label: 'Settle or release + notify' },
] as const

function activeIndex(status: PaymentStatus): number {
  switch (status) {
    case 'PENDING':
      return 0
    case 'PENDING_FRAUD_REVIEW':
      return 2
    case 'APPROVED':
    case 'REJECTED':
      return 3
    default:
      return 0
  }
}

export function PaymentTimeline({ status }: { status: PaymentStatus }) {
  const active = activeIndex(status)

  return (
    <div className="timeline">
      {STEPS.map((step, i) => (
        <div className="timeline-item" key={step.key}>
          <span className={`dot ${i <= active ? 'active' : ''}`} />
          <div>
            <strong>{step.label}</strong>
            {i === 2 && status === 'PENDING_FRAUD_REVIEW' && (
              <div className="muted">Polling saga result via Kafka…</div>
            )}
            {i === 3 && status === 'APPROVED' && (
              <div className="muted">Funds settled to payee path; notification emitted.</div>
            )}
            {i === 3 && status === 'REJECTED' && (
              <div className="muted">Reserved funds released after fraud rejection.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
