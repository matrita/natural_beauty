import { useState } from 'react'
import Input from '../../ui/Input'

const RUOLI_CREATE = ['STAFF', 'ADMIN']
const emptyForm = { email: '', password: '', ruolo: 'STAFF' }

export default function UtenteForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const success = await onSubmit(form)
    if (success) setForm(emptyForm)
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h3 className="form-grid__title">Crea utente</h3>
      <Input
        label="Email"
        name="email"
        type="email"
        required
        fullWidth
        value={form.email}
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
        value={form.password}
        onChange={handleChange}
      />
      <label className="field">
        <span>Ruolo</span>
        <select name="ruolo" value={form.ruolo} onChange={handleChange}>
          {RUOLI_CREATE.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          Crea utente
        </button>
      </div>
    </form>
  )
}
