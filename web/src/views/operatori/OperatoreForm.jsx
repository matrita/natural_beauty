import { useState, useEffect } from 'react'
import Input from '../../ui/Input'

const emptyForm = { nome: '', cognome: '', email: '', specializzazioni: '', attivo: true }

export default function OperatoreForm({ initialData = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm)
  const editingId = initialData?.id

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome,
        cognome: initialData.cognome,
        email: initialData.email,
        specializzazioni: initialData.specializzazioni ?? '',
        attivo: initialData.attivo,
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      specializzazioni: form.specializzazioni || null,
    })
    if (!editingId) setForm(emptyForm)
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <h3 className="form-grid__title">{editingId ? 'Modifica operatore' : 'Nuovo operatore'}</h3>
      <Input label="Nome" name="nome" required value={form.nome} onChange={handleChange} />
      <Input label="Cognome" name="cognome" required value={form.cognome} onChange={handleChange} />
      <Input label="Email" name="email" type="email" required fullWidth value={form.email} onChange={handleChange} />
      <Input label="Specializzazioni" name="specializzazioni" fullWidth value={form.specializzazioni} onChange={handleChange} />
      
      <label className="inline-check field--full">
        <input type="checkbox" name="attivo" checked={form.attivo} onChange={handleChange} />
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
