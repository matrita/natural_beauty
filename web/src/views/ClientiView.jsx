import { useState } from 'react'
import * as clientiApi from '../api/clientiApi'
import ErrorAlert from '../ui/ErrorAlert'
import ClienteForm from './clienti/ClienteForm'
import { useFetch } from '../lib/useFetch'

export default function ClientiView() {
  const { data: items, loading, error, setError, execute: load } = useFetch(clientiApi.listClienti)
  const [editingItem, setEditingItem] = useState(null)

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
    } catch (err) {
      setError(err)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminare questo cliente?')) return
    setError(null)
    try {
      await clientiApi.deleteCliente(id)
      if (editingItem?.id === id) setEditingItem(null)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div className="view">
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <ClienteForm
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        onCancel={() => setEditingItem(null)}
      />

      <div className="panel panel--inner">
        <h3>Elenco</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <ul className="list">
            {items.length === 0 && <li className="muted">Nessun cliente.</li>}
            {items.map((c) => (
              <li key={c.id} className="list-row">
                <div className="list-row__main">
                  <span className="name">
                    {c.nome} {c.cognome}
                  </span>
                  <span className="meta">{c.email}</span>
                </div>
                <div className="list-row__actions">
                  <button type="button" className="btn btn--small" onClick={() => setEditingItem(c)}>
                    Modifica
                  </button>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(c.id)}>
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
