import { useState } from 'react'
import Input from '../../ui/Input'

export default function RegisterForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
    telefono: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return // L'errore sarà gestito dal chiamante o validato qui
    }
    onSubmit(formData)
  }

  return (
    <form className="login__form" onSubmit={handleSubmit}>
      <Input
        label="Nome"
        name="nome"
        required
        fullWidth
        value={formData.nome}
        onChange={handleChange}
      />
      <Input
        label="Cognome"
        name="cognome"
        required
        fullWidth
        value={formData.cognome}
        onChange={handleChange}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        fullWidth
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        label="Telefono (opzionale)"
        name="telefono"
        fullWidth
        value={formData.telefono}
        onChange={handleChange}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={4}
        fullWidth
        value={formData.password}
        onChange={handleChange}
      />
      <Input
        label="Conferma password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={4}
        fullWidth
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
        {loading ? 'Creazione…' : 'Crea account'}
      </button>
    </form>
  )
}
