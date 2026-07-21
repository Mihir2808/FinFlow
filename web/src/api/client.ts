export type PaymentStatus =
  | 'PENDING'
  | 'PENDING_FRAUD_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export interface AuthResponse {
  userId: string
  email: string
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface WalletResponse {
  id: string
  userId: string
  balance: number
  reservedBalance: number
  availableBalance: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface PaymentResponse {
  id: string
  payerId: string
  payeeId: string
  amount: number
  currency: string
  status: PaymentStatus
  idempotencyKey: string
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

type TokenStore = {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (access: string, refresh: string) => void
  clear: () => void
}

let tokenStore: TokenStore = {
  getAccessToken: () => localStorage.getItem('ff_access'),
  getRefreshToken: () => localStorage.getItem('ff_refresh'),
  setTokens: (access, refresh) => {
    localStorage.setItem('ff_access', access)
    localStorage.setItem('ff_refresh', refresh)
  },
  clear: () => {
    localStorage.removeItem('ff_access')
    localStorage.removeItem('ff_refresh')
    localStorage.removeItem('ff_user')
  },
}

export function configureTokenStore(store: TokenStore) {
  tokenStore = store
}

async function parseError(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`
  try {
    const body = await res.json()
    message = body.message || body.error || message
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, message)
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) return false

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    tokenStore.clear()
    return false
  }

  const data = (await res.json()) as AuthResponse
  tokenStore.setTokens(data.accessToken, data.refreshToken)
  localStorage.setItem(
    'ff_user',
    JSON.stringify({ userId: data.userId, email: data.email }),
  )
  return true
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = tokenStore.getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null
      })
    }
    const refreshed = await refreshPromise
    if (refreshed) {
      const retryHeaders = new Headers(options.headers)
      if (!retryHeaders.has('Content-Type') && options.body) {
        retryHeaders.set('Content-Type', 'application/json')
      }
      retryHeaders.set('Authorization', `Bearer ${tokenStore.getAccessToken()}`)
      res = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders })
    }
  }

  if (!res.ok) await parseError(res)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    ),

  login: (email: string, password: string) =>
    request<AuthResponse>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    ),

  createWallet: (userId: string, initialBalance: number, currency = 'BRL') =>
    request<WalletResponse>('/api/wallets', {
      method: 'POST',
      body: JSON.stringify({ userId, initialBalance, currency }),
    }),

  getWallet: (userId: string) =>
    request<WalletResponse>(`/api/wallets/${userId}`),

  createPayment: (payload: {
    payeeId: string
    amount: number
    currency: string
    idempotencyKey: string
  }) =>
    request<PaymentResponse>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getPayment: (id: string) => request<PaymentResponse>(`/api/payments/${id}`),

  listPayments: () => request<PaymentResponse[]>('/api/payments'),
}
