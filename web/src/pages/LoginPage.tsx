import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { login, register, isAuthenticated } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hero-auth">
      <section className="hero-panel">
        <div className="brand" style={{ marginBottom: '1.5rem' }}>
          Fin<span>Flow</span>
        </div>
        <h1>
          Payments that
          <br />
          <em>survive failure.</em>
        </h1>
        <p>
          Live demo of a distributed payment platform — JWT gateway, wallet locks,
          Kafka saga, and fraud review in one flow.
        </p>
      </section>

      <section className="auth-panel">
        <form className="panel" onSubmit={onSubmit}>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="sub">
            {mode === 'login'
              ? 'Sign in to fund a wallet and run a payment through the saga.'
              : 'Register, then open a second account to use as payee.'}
          </p>

          {error && <div className="error">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <div className="switch-auth">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" onClick={() => setMode('register')}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}
