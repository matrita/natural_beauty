import { useCallback, useEffect, useState } from 'react'
import * as clientiApi from '../api/clientiApi'
import ErrorAlert from '../ui/ErrorAlert'

const emptyForm = { nome: '', cognome: '', email: '', telefono: '', note: '' }

export default function ClientiView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await clientiApi.listClienti()
      setItems(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (editingId != null) {
        await clientiApi.updateCliente(editingId, {
          nome: form.nome,
          cognome: form.cognome,
          email: form.email,
          telefono: form.telefono || null,
          note: form.note || null,
        })
      } else {
        await clientiApi.createCliente({
          nome: form.nome,
          cognome: form.cognome,
          email: form.email,
          telefono: form.telefono || null,
          note: form.note || null,
        })
      }
      setForm(emptyForm)
      setEditingId(null)
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
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }
      await load()
    } catch (e) {
      setError(e)
    }
  }

  function startEdit(c) {
    setEditingId(c.id)
    setForm({
      nome: c.nome,
      cognome: c.cognome,
      email: c.email,
      telefono: c.telefono ?? '',
      note: c.note ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div className="view">
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <form className="form-grid" onSubmit={handleSubmit}>
        <h3 className="form-grid__title">{editingId != null ? 'Modifica cliente' : 'Nuovo cliente'}</h3>
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
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(ev) => setForm((f) => ({ ...f, email: ev.target.value }))}
          />
        </label>
        <label className="field">
          <span>Telefono</span>
          <input value={form.telefono} onChange={(ev) => setForm((f) => ({ ...f, telefono: ev.target.value }))} />
        </label>
        <label className="field field--full">
          <span>Note</span>
          <textarea value={form.note} onChange={(ev) => setForm((f) => ({ ...f, note: ev.target.value }))} rows={2} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            {editingId != null ? 'Salva modifiche' : 'Crea cliente'}
          </button>
          {editingId != null && (
            <button type="button" className="btn" onClick={cancelEdit}>
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
                  <button type="button" className="btn btn--small" onClick={() => startEdit(c)}>
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
