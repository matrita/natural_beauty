import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/http'

export default function LoginView() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@naturalbeauty.local')
  const [password, setPassword] = useState('changeme')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Accesso non riuscito'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__card panel">
        <h1 className="login__title">Natural Beauty</h1>
        <p className="login__subtitle">Accedi al pannello</p>
        <form className="login__form" onSubmit={handleSubmit}>
          <label className="field field--full">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field field--full">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
            {loading ? 'Accesso…' : 'Entra'}
          </button>
        </form>
        <p className="muted login__hint">
          Credenziali di sviluppo da <code>application.properties</code> (<code>app.security.bootstrap.*</code>).
        </p>
      </div>
    </div>
  )
}
