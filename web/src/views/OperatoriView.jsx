import { useState } from 'react'
import * as operatoriApi from '../api/operatoriApi'
import ErrorAlert from '../ui/ErrorAlert'
import OperatoreForm from './operatori/OperatoreForm'
import { useFetch } from '../lib/useFetch'

export default function OperatoriView() {
  const { data: items, loading, error, setError, execute: load } = useFetch(operatoriApi.listOperatori)
  const [editingItem, setEditingItem] = useState(null)

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
    } catch (err) {
      setError(err)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminare questo operatore?')) return
    setError(null)
    try {
      await operatoriApi.deleteOperatore(id)
      if (editingItem?.id === id) setEditingItem(null)
      await load()
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div className="view">
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <OperatoreForm
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        onCancel={() => setEditingItem(null)}
      />

      <div className="panel panel--inner">
        <h3>Elenco</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <ul className="list">
            {items.length === 0 && <li className="muted">Nessun operatore.</li>}
            {items.map((o) => (
              <li key={o.id} className="list-row">
                <div className="list-row__main">
                  <span className="name">
                    {o.nome} {o.cognome}
                    {!o.attivo && <span className="badge badge--off"> non attivo</span>}
                  </span>
                  <span className="meta">
                    {o.email}
                    {o.specializzazioni && ` · ${o.specializzazioni}`}
                  </span>
                </div>
                <div className="list-row__actions">
                  <button type="button" className="btn btn--small" onClick={() => setEditingItem(o)}>
                    Modifica
                  </button>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(o.id)}>
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
