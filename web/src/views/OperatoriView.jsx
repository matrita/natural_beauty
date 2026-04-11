import { useState } from 'react'
import * as operatoriApi from '../api/operatoriApi'
import ErrorAlert from '../ui/ErrorAlert'
import OperatoreForm from './operatori/OperatoreForm'
import { useFetch } from '../lib/useFetch'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function OperatoriView() {
  const { data: items, loading, error, setError, execute: load } = useFetch(operatoriApi.listOperatori)
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  async function handleFormSubmit(formData) {
    setError(null)
    try {
      if (editingItem) {
        await operatoriApi.updateOperatore(editingItem.id, formData)
      } else {
        await operatoriApi.createOperatore(formData)
      }
      setEditingItem(null)
      await load()
      return true
    } catch (err) {
      setError(err)
      return false
    }
  }

  async function confirmDelete() {
    if (!itemToDelete) return
    setError(null)
    try {
      await operatoriApi.deleteOperatore(itemToDelete.id)
      if (editingItem?.id === itemToDelete.id) setEditingItem(null)
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
        title="Eliminare operatore?"
        message={`Sei sicuro di voler eliminare l'operatore "${itemToDelete?.nome} ${itemToDelete?.cognome}"?`}
        confirmLabel="Si, elimina"
        cancelLabel="No"
        danger
        onCancel={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
      />

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <section className="panel" style={{ marginBottom: '2rem', background: '#fcfcfc' }}>
        <OperatoreForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingItem(null)}
        />
      </section>

      <div className="panel panel--main">
        <h3 className="panel__title">Staff Tecnico</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <div className="list">
            {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>Nessun operatore registrato.</p>}
            {items.map((o) => (
              <div key={o.id} className="list-row" style={{ padding: '1.5rem 0' }}>
                <div className="list-row__main" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="name" style={{ fontSize: '1.15rem', color: 'var(--brand)' }}>
                      {o.nome} {o.cognome}
                    </span>
                    {!o.attivo && (
                      <span className="badge" style={{ background: '#ffebeb', color: '#d63031' }}>
                        Non attivo
                      </span>
                    )}
                  </div>
                  <div className="meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{o.email}</span>
                    {o.specializzazioni && (
                      <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                        ✨ {o.specializzazioni}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn--small" onClick={() => setEditingItem(o)}>
                    Modifica
                  </button>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => setItemToDelete(o)}>
                    Elimina
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
