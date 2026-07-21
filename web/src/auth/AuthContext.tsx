import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type AuthResponse } from '../api/client'

export interface SessionUser {
  userId: string
  email: string
}

interface AuthContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUser(): SessionUser | null {
  const raw = localStorage.getItem('ff_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

function persistSession(data: AuthResponse) {
  localStorage.setItem('ff_access', data.accessToken)
  localStorage.setItem('ff_refresh', data.refreshToken)
  localStorage.setItem(
    'ff_user',
    JSON.stringify({ userId: data.userId, email: data.email }),
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readUser())

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password)
    persistSession(data)
    setUser({ userId: data.userId, email: data.email })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const data = await api.register(email, password)
    persistSession(data)
    setUser({ userId: data.userId, email: data.email })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ff_access')
    localStorage.removeItem('ff_refresh')
    localStorage.removeItem('ff_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
