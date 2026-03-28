import { useCallback, useEffect, useState } from 'react'
import * as operatoriApi from '../api/operatoriApi'
import ErrorAlert from '../ui/ErrorAlert'

const emptyForm = { nome: '', cognome: '', specializzazioni: '', attivo: true }

export default function OperatoriView() {
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
      const data = await operatoriApi.listOperatori({ soloAttivi })
      setItems(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [soloAttivi])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const body = {
        nome: form.nome,
        cognome: form.cognome,
        specializzazioni: form.specializzazioni || null,
        attivo: form.attivo,
      }
      if (editingId != null) {
        await operatoriApi.updateOperatore(editingId, body)
      } else {
        await operatoriApi.createOperatore(body)
      }
      setForm(emptyForm)
      setEditingId(null)
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
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }
      await load()
    } catch (e) {
      setError(e)
    }
  }

  function startEdit(o) {
    setEditingId(o.id)
    setForm({
      nome: o.nome,
      cognome: o.cognome,
      specializzazioni: o.specializzazioni ?? '',
      attivo: o.attivo,
    })
  }

  return (
    <div className="view">
      <p className="view__hint">
        Modulo <code>operatoriApi.js</code> → <code>/api/operatori</code>
      </p>

      <label className="inline-check">
        <input type="checkbox" checked={soloAttivi} onChange={(e) => setSoloAttivi(e.target.checked)} />
        Mostra solo operatori attivi (filtro GET)
      </label>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <form className="form-grid" onSubmit={handleSubmit}>
        <h3 className="form-grid__title">{editingId != null ? 'Modifica operatore' : 'Nuovo operatore'}</h3>
        <label className="field">
          <span>Nome</span>
          <input
            required
            value={form.nome}
            onChange={(ev) => setForm((f) => ({ ...f, nome: ev.target.value }))}
          />
        </label>
        <label className="field">
          <span>Cognome</span>
          <input
            required
            value={form.cognome}
            onChange={(ev) => setForm((f) => ({ ...f, cognome: ev.target.value }))}
          />
        </label>
        <label className="field field--full">
          <span>Specializzazioni</span>
          <input
            value={form.specializzazioni}
            onChange={(ev) => setForm((f) => ({ ...f, specializzazioni: ev.target.value }))}
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
                  <span className="meta">{o.specializzazioni || '—'}</span>
                </div>
                <div className="list-row__actions">
                  <button type="button" className="btn btn--small" onClick={() => startEdit(o)}>
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
