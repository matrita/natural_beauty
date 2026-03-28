import { useState } from 'react'
import * as utentiApi from '../api/utentiApi'
import ErrorAlert from '../ui/ErrorAlert'
import UtenteForm from './utenti/UtenteForm'
import PasswordDialog from '../ui/PasswordDialog'
import { useFetch } from '../lib/useFetch'

const RUOLI_ALL = ['CLIENTE', 'STAFF', 'ADMIN']

export default function UtentiView() {
  const { data: items, loading, error, setError, execute: load } = useFetch(utentiApi.listUtenti)
  const [resetPasswordFor, setResetPasswordFor] = useState(null) // Contiene l'oggetto utente selezionato

  async function handleCreate(formData) {
    setError(null)
    try {
      await utentiApi.createUtente(formData)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  async function handleChangeRole(id, ruolo) {
    const current = items.find((u) => u.id === id)
    if (!current || current.ruolo === ruolo) return
    setError(null)
    try {
      await utentiApi.updateRuoloUtente(id, ruolo)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  async function handleConfirmResetPassword(newPassword) {
    if (!resetPasswordFor) return
    setError(null)
    try {
      await utentiApi.updatePasswordUtente(resetPasswordFor.id, newPassword)
      setResetPasswordFor(null)
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

      <PasswordDialog
        open={!!resetPasswordFor}
        email={resetPasswordFor?.email}
        onCancel={() => setResetPasswordFor(null)}
        onConfirm={handleConfirmResetPassword}
      />

      <UtenteForm onSubmit={handleCreate} />

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
                  <button type="button" className="btn btn--small" onClick={() => setResetPasswordFor(u)}>
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
