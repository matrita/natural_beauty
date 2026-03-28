import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/http'
import LoginForm from './auth/LoginForm'
import RegisterForm from './auth/RegisterForm'

export default function AuthView() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setError(null)
    setLoading(false)
  }, [mode])

  async function handleLogin(email, password) {
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Accesso non riuscito')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(formData) {
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { confirmPassword, ...data } = formData
      await register(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registrazione non riuscita')
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
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              className={`auth-switch__btn${mode === m ? ' auth-switch__btn--active' : ''}`}
              onClick={() => setMode(m)}
              role="tab"
              aria-selected={mode === m}
            >
              {m === 'login' ? 'Login' : 'Registrazione'}
            </button>
          ))}
        </div>

        {mode === 'login' ? (
          <LoginForm onSubmit={handleLogin} loading={loading} error={mode === 'login' ? error : null} />
        ) : (
          <RegisterForm onSubmit={handleRegister} loading={loading} error={mode === 'register' ? error : null} />
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
