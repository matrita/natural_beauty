import { useState } from 'react'
import * as utentiApi from '../api/utentiApi'
import ErrorAlert from '../ui/ErrorAlert'
import UtenteForm from './utenti/UtenteForm'
import { useFetch } from '../lib/useFetch'
import ConfirmDialog from '../ui/ConfirmDialog'

const RUOLI_ALL = ['CLIENTE', 'STAFF', 'ADMIN']

export default function UtentiView() {
  const { data: items, loading, error, setError, execute: load } = useFetch(utentiApi.listUtenti)
  const [itemToDelete, setItemToDelete] = useState(null)

  async function handleCreate(formData) {
    setError(null)
    try {
      await utentiApi.createUtente(formData)
      await load()
      return true
    } catch (e) {
      setError(e)
      return false
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

  async function confirmDelete() {
    if (!itemToDelete) return
    setError(null)
    try {
      await utentiApi.deleteUtente(itemToDelete.id)
      setItemToDelete(null)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div className="view">
      <ConfirmDialog
        open={!!itemToDelete}
        title="Eliminare utente?"
        message={`Sei sicuro di voler eliminare definitivamente l'account "${itemToDelete?.email}"?`}
        confirmLabel="Si, elimina"
        cancelLabel="No"
        danger
        onCancel={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
      />

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <section className="panel" style={{ marginBottom: '2rem', background: '#fcfcfc' }}>
        <UtenteForm onSubmit={handleCreate} />
      </section>

      <div className="panel panel--main">
        <h3 className="panel__title">Gestione Account</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <div className="list">
            {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>Nessun utente registrato.</p>}
            {items.map((u) => (
              <div key={u.id} className="list-row" style={{ padding: '1.5rem 0' }}>
                <div className="list-row__main" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="name" style={{ fontSize: '1.1rem', color: 'var(--brand)' }}>
                      {u.email}
                    </span>
                  </div>
                  <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Ruolo:</span>
                    <select
                      style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
                      value={u.ruolo || 'STAFF'}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    >
                      {RUOLI_ALL.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => setItemToDelete(u)}>
                    Elimina Account
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
