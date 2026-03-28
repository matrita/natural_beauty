import { useCallback, useEffect, useState } from 'react'
import * as trattamentiApi from '../api/trattamentiApi'
import ErrorAlert from '../ui/ErrorAlert'
import { useAuth } from '../context/AuthContext'
import TrattamentoForm from './trattamenti/TrattamentoForm'
import ConfirmDialog from '../ui/ConfirmDialog'

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
    } catch (err) {
      setError(err)
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

      {!isCliente && (
        <label className="inline-check">
          <input type="checkbox" checked={soloAttivi} onChange={(e) => setSoloAttivi(e.target.checked)} />
          Solo trattamenti attivi (filtro GET)
        </label>
      )}
      {isCliente && <p className="muted">Mostrati solo i trattamenti attivi.</p>}

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {!isCliente && (
        <TrattamentoForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingItem(null)}
        />
      )}

      <div className="panel panel--inner">
        <h3>Elenco</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <ul className="list">
            {items.length === 0 && <li className="muted">Nessun trattamento.</li>}
            {items.map((t) => (
              <li key={t.id} className="list-row">
                <div className="list-row__main">
                  <span className="name">
                    {t.nome}
                    {!t.attivo && <span className="badge badge--off"> non attivo</span>}
                  </span>
                  <span className="meta">
                    {t.durataMinuti} min · {t.prezzo} €
                  </span>
                </div>
                {!isCliente && (
                  <div className="list-row__actions">
                    <button type="button" className="btn btn--small" onClick={() => setEditingItem(t)}>
                      Modifica
                    </button>
                    <button type="button" className="btn btn--small btn--danger" onClick={() => setItemToDelete(t)}>
                      Elimina
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
