import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/http'

export default function AuthView() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'

  const [loginEmail, setLoginEmail] = useState('admin@naturalbeauty.local')
  const [loginPassword, setLoginPassword] = useState('changeme')

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')
  const [regNome, setRegNome] = useState('')
  const [regCognome, setRegCognome] = useState('')
  const [regTelefono, setRegTelefono] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setError(null)
    setLoading(false)
  }, [mode])

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Accesso non riuscito'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    if (regPassword !== regPassword2) {
      setError('Le password non coincidono')
      return
    }
    setLoading(true)
    try {
      await register({
        email: regEmail,
        password: regPassword,
        nome: regNome,
        cognome: regCognome,
        telefono: regTelefono,
      })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registrazione non riuscita'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__card panel">
        <h1 className="login__title">Natural Beauty</h1>
        <p className="login__subtitle">
          {mode === 'login' ? 'Accedi al pannello' : 'Crea un account'}
        </p>

        <div className="auth-switch" role="tablist" aria-label="Autenticazione">
          <button
            type="button"
            className={`auth-switch__btn${mode === 'login' ? ' auth-switch__btn--active' : ''}`}
            onClick={() => setMode('login')}
            role="tab"
            aria-selected={mode === 'login'}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-switch__btn${mode === 'register' ? ' auth-switch__btn--active' : ''}`}
            onClick={() => setMode('register')}
            role="tab"
            aria-selected={mode === 'register'}
          >
            Registrazione
          </button>
        </div>

        {mode === 'login' ? (
          <form className="login__form" onSubmit={handleLogin}>
            <label className="field field--full">
              <span>Email</span>
              <input
                type="email"
                autoComplete="username"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </label>
            <label className="field field--full">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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
        ) : (
          <form className="login__form" onSubmit={handleRegister}>
            <label className="field field--full">
              <span>Nome</span>
              <input required value={regNome} onChange={(e) => setRegNome(e.target.value)} />
            </label>
            <label className="field field--full">
              <span>Cognome</span>
              <input required value={regCognome} onChange={(e) => setRegCognome(e.target.value)} />
            </label>
            <label className="field field--full">
              <span>Email</span>
              <input
                type="email"
                autoComplete="username"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </label>
            <label className="field field--full">
              <span>Telefono (opzionale)</span>
              <input value={regTelefono} onChange={(e) => setRegTelefono(e.target.value)} />
            </label>
            <label className="field field--full">
              <span>Password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={4}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </label>
            <label className="field field--full">
              <span>Conferma password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={4}
                value={regPassword2}
                onChange={(e) => setRegPassword2(e.target.value)}
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
              {loading ? 'Creazione…' : 'Crea account'}
            </button>
          </form>
        )}

        {mode === 'login' && (
          <p className="muted login__hint">
            Credenziali di sviluppo da <code>application.properties</code> (<code>app.security.bootstrap.*</code>).
          </p>
        )}
        {mode === 'register' && (
          <p className="muted login__hint">
            Il nuovo account viene creato con ruolo <code>CLIENTE</code>.
          </p>
        )}
      </div>
    </div>
  )
}
