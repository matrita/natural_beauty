import { useCallback, useEffect, useMemo, useState } from 'react'
import * as utentiApi from '../api/utentiApi'
import ErrorAlert from '../ui/ErrorAlert'

const emptyForm = { email: '', password: '', ruolo: 'STAFF' }
const RUOLI_CREATE = ['STAFF', 'ADMIN']
const RUOLI_ALL = ['CLIENTE', 'STAFF', 'ADMIN']

export default function UtentiView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const byId = useMemo(() => new Map(items.map((u) => [u.id, u])), [items])

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await utentiApi.listUtenti()
      setItems(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    try {
      await utentiApi.createUtente({
        email: form.email,
        password: form.password,
        ruolo: form.ruolo,
      })
      setForm(emptyForm)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  async function handleChangeRole(id, ruolo) {
    const current = byId.get(id)
    if (!current) return
    if (current.ruolo === ruolo) return
    setError(null)
    try {
      await utentiApi.updateRuoloUtente(id, ruolo)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  async function handleResetPassword(id) {
    const pwd = window.prompt('Nuova password (min 4 caratteri):')
    if (!pwd) return
    setError(null)
    try {
      await utentiApi.updatePasswordUtente(id, pwd)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminare questo utente?')) return
    setError(null)
    try {
      await utentiApi.deleteUtente(id)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div className="view">
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <form className="form-grid" onSubmit={handleCreate}>
        <h3 className="form-grid__title">Crea utente</h3>
        <label className="field field--full">
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label className="field field--full">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={4}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>Ruolo</span>
          <select value={form.ruolo} onChange={(e) => setForm((f) => ({ ...f, ruolo: e.target.value }))}>
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

      <div className="panel panel--inner">
        <h3>Elenco</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <ul className="list">
            {items.length === 0 && <li className="muted">Nessun utente.</li>}
            {items.map((u) => (
              <li key={u.id} className="list-row">
                <div className="list-row__main">
                  <span className="name">{u.email}</span>
                  <span className="meta">
                    ruolo:{' '}
                    <select
                      aria-label={`Ruolo per ${u.email}`}
                      value={u.ruolo || 'STAFF'}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    >
                      {RUOLI_ALL.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </span>
                </div>
                <div className="list-row__actions">
                  <button type="button" className="btn btn--small" onClick={() => handleResetPassword(u.id)}>
                    Password
                  </button>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(u.id)}>
                    Elimina
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
