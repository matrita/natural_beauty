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
            {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>Nessun trattamento disponibile.</p>}
            {items.map((t) => (
              <div key={t.id} className="list-row" style={{ padding: '1.5rem 0' }}>
                <div className="list-row__main" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="name" style={{ fontSize: '1.2rem', color: 'var(--brand)' }}>{t.nome}</span>
                    {!t.attivo && <span className="badge badge--off" style={{ background: '#ffebeb', color: '#d63031' }}>Non attivo</span>}
                  </div>
                  <p className="meta" style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '80%' }}>
                    {t.descrizione || 'Nessuna descrizione disponibile.'}
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem', minWidth: '120px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prezzo:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                      € {t.prezzo}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Durata:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--brand)' }}>
                      {t.durataMinuti} min
                    </span>
                  </div>
                  
                  {!isCliente && (
                    <div className="list-row__actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn--small" onClick={() => setEditingItem(t)}>
                         Modifica
                      </button>
                      <button type="button" className="btn btn--small btn--danger" onClick={() => setItemToDelete(t)}>
                         Elimina
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
