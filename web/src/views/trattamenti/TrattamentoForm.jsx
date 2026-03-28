import { useState, useEffect } from 'react'

const emptyForm = { nome: '', durataMinuti: '60', prezzo: '', descrizione: '', attivo: true }

export default function TrattamentoForm({ initialData = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm)
  const editingId = initialData?.id

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome,
        durataMinuti: String(initialData.durataMinuti),
        prezzo: String(initialData.prezzo),
        descrizione: initialData.descrizione ?? '',
        attivo: initialData.attivo,
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      durataMinuti: Number(form.durataMinuti),
      prezzo: String(form.prezzo).replace(',', '.'),
      descrizione: form.descrizione || null,
    })
    if (!editingId) setForm(emptyForm)
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h3 className="form-grid__title">{editingId ? 'Modifica trattamento' : 'Nuovo trattamento'}</h3>
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
          {editingId ? 'Salva' : 'Crea'}
        </button>
        {editingId && (
          <button type="button" className="btn" onClick={onCancel}>
            Annulla
          </button>
        )}
      </div>
    </form>
  )
}
