import type { PaymentStatus } from '../api/client'

const LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PENDING_FRAUD_REVIEW: 'Fraud review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const cls =
    status === 'APPROVED'
      ? 'badge badge-ok'
      : status === 'REJECTED' || status === 'CANCELLED'
        ? 'badge badge-danger'
        : 'badge badge-pending'

  return <span className={cls}>{LABELS[status]}</span>
}
