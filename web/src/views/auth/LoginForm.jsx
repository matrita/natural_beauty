import { useState } from 'react'
import Input from '../../ui/Input'

export default function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState('admin@naturalbeauty.local')
  const [password, setPassword] = useState('changeme')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form className="login__form" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        autoComplete="username"
        required
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
        {loading ? 'Accesso…' : 'Entra'}
      </button>
    </form>
  )
}
