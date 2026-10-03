import { useCallback, useEffect, useState } from 'react'
import * as trattamentiApi from '../api/trattamentiApi'
import ErrorAlert from '../ui/ErrorAlert'
import { useAuth } from '../context/AuthContext'
import TrattamentoForm from './trattamenti/TrattamentoForm'
import ConfirmDialog from '../ui/ConfirmDialog'
import TrattamentoCard from './trattamenti/TrattamentoCard'

export default function TrattamentiView() {
  const { user } = useAuth()
  const isCliente = user?.ruolo === 'CLIENTE'
  const [soloAttivi, setSoloAttivi] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await trattamentiApi.listTrattamenti({ soloAttivi: isCliente ? true : soloAttivi })
      setItems(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [soloAttivi, isCliente])

  useEffect(() => {
    load()
  }, [load])

  async function handleFormSubmit(formData) {
    setError(null)
    try {
      if (editingItem) {
        await trattamentiApi.updateTrattamento(editingItem.id, formData)
      } else {
        await trattamentiApi.createTrattamento(formData)
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
      await trattamentiApi.deleteTrattamento(itemToDelete.id)
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
        title="Eliminare trattamento?"
        message={`Sei sicuro di voler eliminare definitivamente il trattamento "${itemToDelete?.nome}"?`}
        confirmLabel="Si, elimina"
        cancelLabel="No"
        danger
        onCancel={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          {isCliente ? 'Sfoglia i nostri servizi esclusivi.' : 'Gestisci il catalogo dei trattamenti.'}
        </p>
        {!isCliente && (
          <label className="inline-check" style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={soloAttivi} onChange={(e) => setSoloAttivi(e.target.checked)} />
            Filtra solo attivi
          </label>
        )}
      </div>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {!isCliente && (
        <section className="panel" style={{ marginBottom: '2rem', borderStyle: 'solid', background: '#fcfcfc' }}>
          <TrattamentoForm
            initialData={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setEditingItem(null)}
          />
        </section>
      )}

      <div className="panel panel--main">
        <h3 className="panel__title">I Nostri Servizi</h3>
        {loading && <p className="muted">Caricamento in corso...</p>}
        {!loading && (
          <div className="list">
            {(items || []).length === 0 && <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>Nessun trattamento disponibile.</p>}
            {(items || []).map((t) => (
              <TrattamentoCard 
                key={t.id}
                trattamento={t}
                isCliente={isCliente}
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
