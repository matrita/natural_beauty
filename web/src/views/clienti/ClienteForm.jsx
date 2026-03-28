import { useState, useEffect } from 'react'
import Input from '../../ui/Input'

const emptyForm = { nome: '', cognome: '', email: '', telefono: '', note: '' }

export default function ClienteForm({ initialData = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm)
  const editingId = initialData?.id

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome,
        cognome: initialData.cognome,
        email: initialData.email,
        telefono: initialData.telefono ?? '',
        note: initialData.note ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      telefono: form.telefono || null,
      note: form.note || null,
    })
    if (!editingId) setForm(emptyForm)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h3 className="form-grid__title">{editingId ? 'Modifica cliente' : 'Nuovo cliente'}</h3>
      <Input label="Nome" name="nome" required value={form.nome} onChange={handleChange} />
      <Input label="Cognome" name="cognome" required value={form.cognome} onChange={handleChange} />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        fullWidth
        value={form.email}
        onChange={handleChange}
      />
      <Input label="Telefono" name="telefono" value={form.telefono} onChange={handleChange} />
      
      <label className="field field--full">
        <span>Note</span>
        <textarea name="note" value={form.note} onChange={handleChange} rows={2} />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {editingId ? 'Salva modifiche' : 'Crea cliente'}
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
