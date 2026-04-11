import { useState } from 'react'
import * as clientiApi from '../api/clientiApi'
import ErrorAlert from '../ui/ErrorAlert'
import ClienteForm from './clienti/ClienteForm'
import { useFetch } from '../lib/useFetch'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function ClientiView() {
  const { data: items, loading, error, setError, execute: load } = useFetch(clientiApi.listClienti)
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  async function handleFormSubmit(formData) {
    setError(null)
    try {
      if (editingItem) {
        await clientiApi.updateCliente(editingItem.id, formData)
      } else {
        await clientiApi.createCliente(formData)
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
      await clientiApi.deleteCliente(itemToDelete.id)
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
        title="Eliminare cliente?"
        message={`Sei sicuro di voler eliminare definitivamente il cliente "${itemToDelete?.nome} ${itemToDelete?.cognome}"?`}
        confirmLabel="Si, elimina"
        cancelLabel="No"
        danger
        onCancel={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
      />

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <section className="panel" style={{ marginBottom: '2rem', background: '#fcfcfc' }}>
        <ClienteForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingItem(null)}
        />
      </section>

      <div className="panel panel--main">
        <h3 className="panel__title">Anagrafica Clienti</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <div className="list">
            {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>Nessun cliente registrato.</p>}
            {items.map((c) => (
              <div key={c.id} className="list-row" style={{ padding: '1.5rem 0' }}>
                <div className="list-row__main" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="name" style={{ fontSize: '1.15rem', color: 'var(--brand)' }}>
                      {c.nome} {c.cognome}
                    </span>
                  </div>
                  <div className="meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>📧 {c.email}</span>
                    {c.telefono && (
                      <span style={{ fontSize: '0.85rem' }}>📞 {c.telefono}</span>
                    )}
                    {c.note && (
                      <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginTop: '0.3rem', color: 'var(--muted)' }}>
                        📝 {c.note}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn--small" onClick={() => setEditingItem(c)}>
                    Modifica
                  </button>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => setItemToDelete(c)}>
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
