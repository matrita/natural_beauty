import { useState, useCallback } from 'react'
import * as appuntamentiApi from '../../api/appuntamentiApi'
import { addDays, startOfDay, toDateTimeLocalValue } from '../../lib/dateUtils'
import ErrorAlert from '../../ui/ErrorAlert'
import ConfirmDialog from '../../ui/ConfirmDialog'
import PeriodSelector from './PeriodSelector'
import { useAppuntamentiRefs } from './useAppuntamentiRefs'
import { useFetch } from '../../lib/useFetch'

export default function ClienteAppuntamentiView() {
  const start = startOfDay()
  const end = addDays(start, 14)
  const [da, setDa] = useState(toDateTimeLocalValue(start))
  const [a, setA] = useState(toDateTimeLocalValue(end))

  const { operatori, trattamenti, error: refsError } = useAppuntamentiRefs(false)

  // Stabilizziamo la funzione di fetch con useCallback
  const fetchMieiAppuntamenti = useCallback(() => {
    let daIso = da + (da.length === 16 ? ':00' : '')
    let aIso = a + (a.length === 16 ? ':00' : '')
    return appuntamentiApi.listMieiAppuntamenti(daIso, aIso)
  }, [da, a])

  const { data: items, loading, error: listError, setError: setListError, execute: loadMiei } = useFetch(
    fetchMieiAppuntamenti,
    { immediate: true }
  )

  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [confirmCancelId, setConfirmCancelId] = useState(null)
  const [form, setForm] = useState({ operatoreId: '', trattamentoId: '', slot: '', note: '' })

  async function handleCercaDisponibilita() {
    if (!form.operatoreId || !form.trattamentoId) {
      setListError({ message: 'Seleziona operatore e trattamento' })
      return
    }
    setListError(null)
    setLoadingSlots(true)
    try {
      let daIso = da + (da.length === 16 ? ':00' : '')
      let aIso = a + (a.length === 16 ? ':00' : '')
      const data = await appuntamentiApi.disponibilita(
        Number(form.operatoreId), Number(form.trattamentoId), daIso, aIso, 15
      )
      setSlots(data)
      setForm((f) => ({ ...f, slot: data[0] ? normalizeForInput(String(data[0])) : '' }))
    } catch (e) {
      setListError(e)
    } finally {
      setLoadingSlots(false)
    }
  }

  async function handlePrenota(e) {
    e.preventDefault()
    setListError(null)
    try {
      if (!form.slot) throw new Error('Seleziona uno slot disponibile')
      const dt = String(form.slot).length === 16 ? `${form.slot}:00` : String(form.slot)
      await appuntamentiApi.createMioAppuntamento({
        operatoreId: Number(form.operatoreId),
        trattamentoId: Number(form.trattamentoId),
        dataOraInizio: dt,
        note: form.note || null,
      })
      setForm((f) => ({ ...f, note: '' }))
      await loadMiei()
      await handleCercaDisponibilita()
    } catch (e) {
      setListError(e)
    }
  }

  async function handleCancella(id) {
    setListError(null)
    try {
      await appuntamentiApi.cancellaMioAppuntamento(id)
      await loadMiei()
      if (form.operatoreId && form.trattamentoId) await handleCercaDisponibilita()
    } catch (e) {
      setListError(e)
    }
  }

  function normalizeForInput(iso) {
    if (!iso) return ''
    const s = String(iso).replace(' ', 'T')
    return s.length >= 16 ? s.slice(0, 16) : s
  }

  const apToCancel = confirmCancelId != null ? items.find((x) => x.id === confirmCancelId) : null
  const error = refsError || listError

  return (
    <div className="view">
      <ConfirmDialog
        open={confirmCancelId != null}
        title="Confermi la cancellazione?"
        message={
          apToCancel && (
            <div>
              Stai per cancellare questo appuntamento:
              <ul className="modal__details">
                <li><strong>Quando:</strong> {normalizeForInput(apToCancel.dataOraInizio)}</li>
                <li><strong>Trattamento:</strong> {apToCancel.trattamentoNome}</li>
                <li><strong>Operatore:</strong> {apToCancel.operatoreNomeCompleto}</li>
              </ul>
            </div>
          )
        }
        confirmLabel="Si, cancella"
        cancelLabel="No"
        danger
        onCancel={() => setConfirmCancelId(null)}
        onConfirm={async () => {
          const id = confirmCancelId
          setConfirmCancelId(null)
          if (id != null) await handleCancella(id)
        }}
      />
      <ErrorAlert error={error} onDismiss={() => setListError(null)} />

      <PeriodSelector
        da={da}
        a={a}
        onDaChange={setDa}
        onAChange={setA}
        onReload={() => loadMiei()}
        title="Periodo (disponibilita e appuntamenti)"
      />

      <form className="form-grid" onSubmit={handlePrenota}>
        <h3 className="form-grid__title">Prenota un appuntamento</h3>
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
        <div className="form-actions">
          <button type="button" className="btn" onClick={handleCercaDisponibilita} disabled={loadingSlots}>
            {loadingSlots ? 'Cerco…' : 'Cerca disponibilita'}
          </button>
        </div>
        <label className="field field--full">
          <span>Orari disponibili</span>
          <select required value={form.slot} onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}>
            {slots.length === 0 && <option value="">— premi "Cerca disponibilita" —</option>}
            {slots.map((s) => (
              <option key={normalizeForInput(String(s))} value={normalizeForInput(String(s))}>
                {normalizeForInput(String(s))}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">Disponibilita trovate: {slots.length}</p>
        <label className="field field--full">
          <span>Note</span>
          <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={2} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">Prenota</button>
        </div>
      </form>

      <div className="panel panel--inner">
        <h3>I miei appuntamenti</h3>
        {loading && <p className="muted">Caricamento…</p>}
        {!loading && (
          <ul className="list list--appuntamenti">
            {items.length === 0 && <li className="muted">Nessun appuntamento nel periodo.</li>}
            {items.map((ap) => (
              <li key={ap.id} className="list-row list-row--stack">
                <div className="list-row__main">
                  <span className="name">{normalizeForInput(ap.dataOraInizio)} · {ap.trattamentoNome}</span>
                  <span className="meta">{ap.operatoreNomeCompleto} · {ap.trattamentoDurataMinuti} min · stato: {ap.stato}</span>
                </div>
                <div className="app-row__controls">
                  <button type="button" className="btn btn--small btn--danger" onClick={() => setConfirmCancelId(ap.id)}>
                    Cancella
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
