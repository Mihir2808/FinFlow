import type { PaymentStatus } from '../api/client'

const STEPS = [
  { key: 'created', label: 'Payment created' },
  { key: 'reserved', label: 'Wallet balance reserved' },
  { key: 'fraud', label: 'Fraud service analyzing' },
  { key: 'final', label: 'Settle or release + notify' },
] as const

function isInsufficientFunds(reason: string | null | undefined) {
  return (reason ?? '').toLowerCase().includes('insufficient')
}

function activeIndex(status: PaymentStatus, reason: string | null | undefined): number {
  if (status === 'REJECTED' && isInsufficientFunds(reason)) {
    // Failed at reserve — never reached fraud
    return 1
  }
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

export function PaymentTimeline({
  status,
  rejectionReason,
}: {
  status: PaymentStatus
  rejectionReason?: string | null
}) {
  const active = activeIndex(status, rejectionReason)
  const insufficient = status === 'REJECTED' && isInsufficientFunds(rejectionReason)
  const fraudReject = status === 'REJECTED' && !insufficient

  return (
    <div className="timeline">
      {STEPS.map((step, i) => (
        <div className="timeline-item" key={step.key}>
          <span className={`dot ${i <= active ? 'active' : ''}`} />
          <div>
            <strong>{step.label}</strong>
            {i === 1 && insufficient && (
              <div className="muted">Reserve failed — not enough available balance.</div>
            )}
            {i === 2 && status === 'PENDING_FRAUD_REVIEW' && (
              <div className="muted">Polling saga result via Kafka…</div>
            )}
            {i === 2 && insufficient && (
              <div className="muted">Skipped — fraud never ran.</div>
            )}
            {i === 3 && status === 'APPROVED' && (
              <div className="muted">Payer debited, payee credited; notification emitted.</div>
            )}
            {i === 3 && fraudReject && (
              <div className="muted">Fraud rejected — reserved funds released to payer.</div>
            )}
            {i === 3 && insufficient && (
              <div className="muted">Stopped before fraud. Top up wallet to demo the &gt;50k fraud rule.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
