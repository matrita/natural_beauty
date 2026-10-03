import { useState } from 'react'
import * as operatoriApi from '../api/operatoriApi'
import ErrorAlert from '../ui/ErrorAlert'
import OperatoreForm from './operatori/OperatoreForm'
import { useFetch } from '../lib/useFetch'
import ConfirmDialog from '../ui/ConfirmDialog'
import OperatoreCard from './operatori/OperatoreCard'

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
              <OperatoreCard
                key={o.id}
                operatore={o}
                onEdit={setEditingItem}
                onDelete={setItemToDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
