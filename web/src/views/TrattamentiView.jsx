import { useCallback, useEffect, useState } from 'react'
import * as trattamentiApi from '../api/trattamentiApi'
import ErrorAlert from '../ui/ErrorAlert'
import { useAuth } from '../context/AuthContext'

const emptyForm = { nome: '', durataMinuti: '60', prezzo: '', descrizione: '', attivo: true }

export default function TrattamentiView() {
  const { user } = useAuth()
  const isCliente = user?.ruolo === 'CLIENTE'
  const [soloAttivi, setSoloAttivi] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

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

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const body = {
        nome: form.nome,
        durataMinuti: Number(form.durataMinuti),
        prezzo: String(form.prezzo).replace(',', '.'),
        descrizione: form.descrizione || null,
        attivo: form.attivo,
      }
      if (editingId != null) {
        await trattamentiApi.updateTrattamento(editingId, body)
      } else {
        await trattamentiApi.createTrattamento(body)
      }
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminare questo trattamento?')) return
    setError(null)
    try {
      await trattamentiApi.deleteTrattamento(id)
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }
      await load()
    } catch (e) {
      setError(e)
    }
  }

  function startEdit(t) {
    setEditingId(t.id)
    setForm({
      nome: t.nome,
      durataMinuti: String(t.durataMinuti),
      prezzo: String(t.prezzo),
      descrizione: t.descrizione ?? '',
      attivo: t.attivo,
    })
  }

  return (
    <div className="view">
      {!isCliente && (
        <label className="inline-check">
          <input type="checkbox" checked={soloAttivi} onChange={(e) => setSoloAttivi(e.target.checked)} />
          Solo trattamenti attivi (filtro GET)
        </label>
      )}
      {isCliente && <p className="muted">Mostrati solo i trattamenti attivi.</p>}

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {!isCliente && (
        <form className="form-grid" onSubmit={handleSubmit}>
          <h3 className="form-grid__title">{editingId != null ? 'Modifica trattamento' : 'Nuovo trattamento'}</h3>
          <label className="field field--full">
            <span>Nome</span>
            <input
              required
              value={form.nome}
              onChange={(ev) => setForm((f) => ({ ...f, nome: ev.target.value }))}
            />
          </label>
          <label className="field">
            <span>Durata (min)</span>
            <input
              type="number"
              required
              min={5}
              value={form.durataMinuti}
              onChange={(ev) => setForm((f) => ({ ...f, durataMinuti: ev.target.value }))}
            />
          </label>
          <label className="field">
            <span>Prezzo</span>
            <input
              type="text"
              required
              placeholder="es. 45.00"
              value={form.prezzo}
              onChange={(ev) => setForm((f) => ({ ...f, prezzo: ev.target.value }))}
            />
          </label>
          <label className="field field--full">
            <span>Descrizione</span>
            <textarea
              value={form.descrizione}
              onChange={(ev) => setForm((f) => ({ ...f, descrizione: ev.target.value }))}
              rows={2}
            />
          </label>
          <label className="inline-check field--full">
            <input
              type="checkbox"
              checked={form.attivo}
              onChange={(ev) => setForm((f) => ({ ...f, attivo: ev.target.checked }))}
            />
            Attivo
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary">
              {editingId != null ? 'Salva' : 'Crea'}
            </button>
            {editingId != null && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                }}
              >
                Annulla
              </button>
            )}
          </div>
        </form>
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
                    <button type="button" className="btn btn--small" onClick={() => startEdit(t)}>
                      Modifica
                    </button>
                    <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(t.id)}>
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
