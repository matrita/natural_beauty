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
            {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>Nessun trattamento disponibile.</p>}
            {items.map((t) => (
              <div key={t.id} className="list-row">
                <div className="list-row__main" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="name">{t.nome}</span>
                    {!t.attivo && <span className="badge badge--off" style={{ background: '#ffebeb', color: '#d63031' }}>Non attivo</span>}
                  </div>
                  <p className="meta" style={{ marginTop: '0.2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {t.descrizione || 'Nessuna descrizione disponibile.'}
                  </p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                    <span className="badge" style={{ margin: 0, padding: '0.3rem 0.8rem', background: '#f5f7f5' }}>
                       ⏱ {t.durataMinuti} min
                    </span>
                    <span className="badge" style={{ margin: 0, padding: '0.3rem 0.8rem', background: '#fdf8f3', color: '#d4a373' }}>
                       € {t.prezzo}
                    </span>
                  </div>
                </div>
                {!isCliente && (
                  <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn--small" onClick={() => setEditingItem(t)}>
                       Modifica
                    </button>
                    <button type="button" className="btn btn--small btn--danger" onClick={() => setItemToDelete(t)}>
                       Elimina
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
