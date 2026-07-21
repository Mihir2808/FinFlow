import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Fin<span>Flow</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/payments">Payments</NavLink>
          <NavLink to="/wallet">Wallet</NavLink>
          <NavLink to="/story">Resume story</NavLink>
        </nav>
        <div className="copy-row">
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {user?.email}
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
