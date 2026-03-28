import { useState, useCallback } from 'react'
import * as appuntamentiApi from '../../api/appuntamentiApi'
import { addDays, startOfDay, toDateTimeLocalValue } from '../../lib/dateUtils'
import ErrorAlert from '../../ui/ErrorAlert'
import PeriodSelector from './PeriodSelector'
import Input from '../../ui/Input'
import { useAppuntamentiRefs } from './useAppuntamentiRefs'
import { useFetch } from '../../lib/useFetch'

const STATI = ['PRENOTATO', 'CONFERMATO', 'COMPLETATO', 'CANCELLATO']

export default function StaffAppuntamentiView() {
  const start = startOfDay()
  const end = addDays(start, 7)
  const [da, setDa] = useState(toDateTimeLocalValue(start))
  const [a, setA] = useState(toDateTimeLocalValue(end))

  const { clienti, operatori, trattamenti, error: refsError } = useAppuntamentiRefs()

  // Stabilizziamo la funzione di fetch con useCallback
  const fetchAppuntamenti = useCallback(() => {
    let daIso = da + (da.length === 16 ? ':00' : '')
    let aIso = a + (a.length === 16 ? ':00' : '')
    return appuntamentiApi.listAppuntamenti(daIso, aIso)
  }, [da, a])

  const { data: items, loading, error: listError, setError: setListError, execute: loadAppuntamenti } = useFetch(
    fetchAppuntamenti,
    { immediate: true }
  )

  const [form, setForm] = useState({
    clienteId: '',
    operatoreId: '',
    trattamentoId: '',
    dataOraInizio: toDateTimeLocalValue(new Date()),
    note: '',
  })

  async function handleCreate(e) {
    e.preventDefault()
    setListError(null)
    try {
      let dt = form.dataOraInizio + (form.dataOraInizio.length === 16 ? ':00' : '')
      await appuntamentiApi.createAppuntamento({
        clienteId: Number(form.clienteId),
        operatoreId: Number(form.operatoreId),
        trattamentoId: Number(form.trattamentoId),
        dataOraInizio: dt,
        note: form.note || null,
      })
      setForm((f) => ({ ...f, note: '' }))
      await loadAppuntamenti()
    } catch (err) {
      setListError(err)
    }
  }

  async function handleStatoChange(id, stato) {
    setListError(null)
    try {
      await appuntamentiApi.updateStatoAppuntamento(id, stato)
      await loadAppuntamenti()
    } catch (e) {
      setListError(e)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminare questo appuntamento?')) return
    setListError(null)
    try {
      await appuntamentiApi.deleteAppuntamento(id)
      await loadAppuntamenti()
    } catch (e) {
      setListError(e)
    }
  }

  function normalizeForDisplay(iso) {
    if (!iso) return ''
    return iso.replace(' ', ' T ').replace('T', ' ')
  }

  const error = refsError || listError

  return (
    <div className="view">
      <ErrorAlert error={error} onDismiss={() => setListError(null)} />

      <PeriodSelector
        da={da}
        a={a}
        onDaChange={setDa}
        onAChange={setA}
        onReload={() => loadAppuntamenti()}
        title="Periodo lista"
      />

      <form className="form-grid" onSubmit={handleCreate}>
        <h3 className="form-grid__title">Nuova prenotazione</h3>
        <label className="field field--full">
          <span>Cliente</span>
          <select required value={form.clienteId} onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}>
            <option value="">— seleziona —</option>
            {clienti.map((c) => <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>)}
          </select>
        </label>
        <label className="field field--full">
          <span>Operatore</span>
          <select required value={form.operatoreId} onChange={(e) => setForm((f) => ({ ...f, operatoreId: e.target.value }))}>
            <option value="">— seleziona —</option>
            {operatori.map((o) => <option key={o.id} value={o.id}>{o.nome} {o.cognome}</option>)}
          </select>
        </label>
        <label className="field field--full">
          <span>Trattamento</span>
          <select required value={form.trattamentoId} onChange={(e) => setForm((f) => ({ ...f, trattamentoId: e.target.value }))}>
            <option value="">— seleziona —</option>
            {trattamenti.map((t) => <option key={t.id} value={t.id}>{t.nome} ({t.durataMinuti} min)</option>)}
          </select>
        </label>
        <Input
          label="Data e ora inizio"
          type="datetime-local"
          required
          fullWidth
          value={form.dataOraInizio}
          onChange={(e) => setForm((f) => ({ ...f, dataOraInizio: e.target.value }))}
        />
        <label className="field field--full">
          <span>Note</span>
          <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={2} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">Prenota</button>
        </div>
      </form>

      <div className="panel panel--inner">
        <h3>Appuntamenti nel periodo</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <ul className="list list--appuntamenti">
            {items.length === 0 && <li className="muted">Nessun appuntamento.</li>}
            {items.map((ap) => (
              <li key={ap.id} className="list-row list-row--stack">
                <div className="list-row__main">
                  <span className="name">{normalizeForDisplay(ap.dataOraInizio)} · {ap.trattamentoNome}</span>
                  <span className="meta">{ap.clienteNomeCompleto} · {ap.operatoreNomeCompleto} · {ap.trattamentoDurataMinuti} min</span>
                </div>
                <div className="app-row__controls">
                  <select value={ap.stato} onChange={(e) => handleStatoChange(ap.id, e.target.value)}>
                    {STATI.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(ap.id)}>Elimina</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
