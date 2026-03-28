import { useCallback, useEffect, useState } from 'react'
import * as appuntamentiApi from '../api/appuntamentiApi'
import * as clientiApi from '../api/clientiApi'
import * as operatoriApi from '../api/operatoriApi'
import * as trattamentiApi from '../api/trattamentiApi'
import { addDays, startOfDay, toDateTimeLocalValue } from '../lib/dateUtils'
import ErrorAlert from '../ui/ErrorAlert'
import { useAuth } from '../context/AuthContext'

const STATI = ['PRENOTATO', 'CONFERMATO', 'COMPLETATO', 'CANCELLATO']

export default function AppuntamentiView() {
  const { user } = useAuth()
  if (user?.ruolo === 'CLIENTE') {
    return <ClienteAppuntamentiView />
  }
  return <StaffAppuntamentiView />
}

function StaffAppuntamentiView() {
  const start = startOfDay()
  const end = addDays(start, 7)
  const [da, setDa] = useState(toDateTimeLocalValue(start))
  const [a, setA] = useState(toDateTimeLocalValue(end))
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [clientiOpts, setClientiOpts] = useState([])
  const [operatoriOpts, setOperatoriOpts] = useState([])
  const [trattamentiOpts, setTrattamentiOpts] = useState([])

  const [form, setForm] = useState({
    clienteId: '',
    operatoreId: '',
    trattamentoId: '',
    dataOraInizio: toDateTimeLocalValue(new Date()),
    note: '',
  })

  const loadRefs = useCallback(async () => {
    try {
      const [c, o, t] = await Promise.all([
        clientiApi.listClienti(),
        operatoriApi.listOperatori({ soloAttivi: true }),
        trattamentiApi.listTrattamenti({ soloAttivi: true }),
      ])
      setClientiOpts(c)
      setOperatoriOpts(o)
      setTrattamentiOpts(t)
    } catch (e) {
      setError(e)
    }
  }, [])

  const loadAppuntamenti = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      let daIso = da
      let aIso = a
      if (daIso.length === 16) daIso += ':00'
      if (aIso.length === 16) aIso += ':00'
      const data = await appuntamentiApi.listAppuntamenti(daIso, aIso)
      setItems(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [da, a])

  useEffect(() => {
    loadRefs()
  }, [loadRefs])

  useEffect(() => {
    loadAppuntamenti()
  }, [loadAppuntamenti])

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    try {
      let dt = form.dataOraInizio
      if (dt.length === 16) dt += ':00'
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
      setError(err)
    }
  }

  async function handleStatoChange(id, stato) {
    setError(null)
    try {
      await appuntamentiApi.updateStatoAppuntamento(id, stato)
      await loadAppuntamenti()
    } catch (e) {
      setError(e)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminare questo appuntamento?')) return
    setError(null)
    try {
      await appuntamentiApi.deleteAppuntamento(id)
      await loadAppuntamenti()
    } catch (e) {
      setError(e)
    }
  }

  function normalizeForInput(iso) {
    if (!iso) return ''
    const s = iso.replace(' ', 'T')
    return s.length >= 16 ? s.slice(0, 16) : s
  }

  return (
    <div className="view">
      <p className="view__hint">
        Modulo <code>appuntamentiApi.js</code> → <code>/api/appuntamenti</code> (usa anche altri API per le tendine)
      </p>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <div className="panel panel--inner filter-bar">
        <h3>Periodo lista</h3>
        <div className="form-grid form-grid--compact">
          <label className="field">
            <span>Da</span>
            <input type="datetime-local" value={da} onChange={(e) => setDa(e.target.value)} />
          </label>
          <label className="field">
            <span>A</span>
            <input type="datetime-local" value={a} onChange={(e) => setA(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--primary" onClick={() => loadAppuntamenti()}>
              Ricarica elenco
            </button>
          </div>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleCreate}>
        <h3 className="form-grid__title">Nuova prenotazione</h3>
        <label className="field field--full">
          <span>Cliente</span>
          <select
            required
            value={form.clienteId}
            onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
          >
            <option value="">— seleziona —</option>
            {clientiOpts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.cognome}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>Operatore</span>
          <select
            required
            value={form.operatoreId}
            onChange={(e) => setForm((f) => ({ ...f, operatoreId: e.target.value }))}
          >
            <option value="">— seleziona —</option>
            {operatoriOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome} {o.cognome}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>Trattamento</span>
          <select
            required
            value={form.trattamentoId}
            onChange={(e) => setForm((f) => ({ ...f, trattamentoId: e.target.value }))}
          >
            <option value="">— seleziona —</option>
            {trattamentiOpts.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.durataMinuti} min)
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>Data e ora inizio</span>
          <input
            type="datetime-local"
            required
            value={form.dataOraInizio}
            onChange={(e) => setForm((f) => ({ ...f, dataOraInizio: e.target.value }))}
          />
        </label>
        <label className="field field--full">
          <span>Note</span>
          <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={2} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Prenota
          </button>
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
                  <span className="name">
                    {normalizeForInput(ap.dataOraInizio)} · {ap.trattamentoNome}
                  </span>
                  <span className="meta">
                    {ap.clienteNomeCompleto} · {ap.operatoreNomeCompleto} · {ap.trattamentoDurataMinuti} min
                  </span>
                </div>
                <div className="app-row__controls">
                  <label className="field field--inline">
                    <span className="sr-only">Stato</span>
                    <select
                      value={ap.stato}
                      onChange={(e) => handleStatoChange(ap.id, e.target.value)}
                      aria-label="Stato appuntamento"
                    >
                      {STATI.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => handleDelete(ap.id)}>
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

function ClienteAppuntamentiView() {
  const start = startOfDay()
  const end = addDays(start, 14)
  const [da, setDa] = useState(toDateTimeLocalValue(start))
  const [a, setA] = useState(toDateTimeLocalValue(end))

  const [operatoriOpts, setOperatoriOpts] = useState([])
  const [trattamentiOpts, setTrattamentiOpts] = useState([])
  const [slots, setSlots] = useState([])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [form, setForm] = useState({
    operatoreId: '',
    trattamentoId: '',
    slot: '',
    note: '',
  })

  const loadRefs = useCallback(async () => {
    setError(null)
    try {
      const [o, t] = await Promise.all([
        operatoriApi.listOperatori({ soloAttivi: true }),
        trattamentiApi.listTrattamenti({ soloAttivi: true }),
      ])
      setOperatoriOpts(o)
      setTrattamentiOpts(t)
    } catch (e) {
      setError(e)
    }
  }, [])

  const loadMiei = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      let daIso = da
      let aIso = a
      if (daIso.length === 16) daIso += ':00'
      if (aIso.length === 16) aIso += ':00'
      const data = await appuntamentiApi.listMieiAppuntamenti(daIso, aIso)
      setItems(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [da, a])

  useEffect(() => {
    loadRefs()
  }, [loadRefs])

  useEffect(() => {
    loadMiei()
  }, [loadMiei])

  async function handleCercaDisponibilita() {
    if (!form.operatoreId || !form.trattamentoId) {
      setError({ message: 'Seleziona operatore e trattamento' })
      return
    }
    setError(null)
    setLoadingSlots(true)
    try {
      let daIso = da
      let aIso = a
      if (daIso.length === 16) daIso += ':00'
      if (aIso.length === 16) aIso += ':00'
      const data = await appuntamentiApi.disponibilita(
        Number(form.operatoreId),
        Number(form.trattamentoId),
        daIso,
        aIso,
        15,
      )
      setSlots(data)
      setForm((f) => ({ ...f, slot: data[0] ? normalizeForInput(String(data[0])) : '' }))
    } catch (e) {
      setError(e)
    } finally {
      setLoadingSlots(false)
    }
  }

  async function handlePrenota(e) {
    e.preventDefault()
    setError(null)
    try {
      if (!form.slot) {
        throw new Error('Seleziona uno slot disponibile')
      }
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
      setError(e)
    }
  }

  async function handleCancella(id) {
    if (!window.confirm('Cancellare questo appuntamento?')) return
    setError(null)
    try {
      await appuntamentiApi.cancellaMioAppuntamento(id)
      await loadMiei()
    } catch (e) {
      setError(e)
    }
  }

  function normalizeForInput(iso) {
    if (!iso) return ''
    const s = String(iso).replace(' ', 'T')
    return s.length >= 16 ? s.slice(0, 16) : s
  }

  return (
    <div className="view">
      <p className="view__hint">
        Area cliente: trattamenti attivi, disponibilita e prenotazione.
      </p>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <div className="panel panel--inner filter-bar">
        <h3>Periodo (disponibilita e appuntamenti)</h3>
        <div className="form-grid form-grid--compact">
          <label className="field">
            <span>Da</span>
            <input type="datetime-local" value={da} onChange={(e) => setDa(e.target.value)} />
          </label>
          <label className="field">
            <span>A</span>
            <input type="datetime-local" value={a} onChange={(e) => setA(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--primary" onClick={() => loadMiei()}>
              Ricarica
            </button>
          </div>
        </div>
      </div>

      <form className="form-grid" onSubmit={handlePrenota}>
        <h3 className="form-grid__title">Prenota un appuntamento</h3>
        <label className="field field--full">
          <span>Operatore</span>
          <select
            required
            value={form.operatoreId}
            onChange={(e) => setForm((f) => ({ ...f, operatoreId: e.target.value }))}
          >
            <option value="">— seleziona —</option>
            {operatoriOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome} {o.cognome}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>Trattamento</span>
          <select
            required
            value={form.trattamentoId}
            onChange={(e) => setForm((f) => ({ ...f, trattamentoId: e.target.value }))}
          >
            <option value="">— seleziona —</option>
            {trattamentiOpts.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.durataMinuti} min)
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button type="button" className="btn" onClick={handleCercaDisponibilita} disabled={loadingSlots}>
            {loadingSlots ? 'Cerco…' : 'Cerca disponibilita'}
          </button>
        </div>
        <label className="field field--full">
          <span>Orari disponibili</span>
          <select
            required
            value={form.slot}
            onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
          >
            {slots.length === 0 && <option value="">— premi "Cerca disponibilita" —</option>}
            {slots.map((s) => (
              <option key={normalizeForInput(String(s))} value={normalizeForInput(String(s))}>
                {normalizeForInput(String(s))}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>Note</span>
          <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={2} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Prenota
          </button>
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
                  <span className="name">
                    {normalizeForInput(ap.dataOraInizio)} · {ap.trattamentoNome}
                  </span>
                  <span className="meta">
                    {ap.operatoreNomeCompleto} · {ap.trattamentoDurataMinuti} min · stato: {ap.stato}
                  </span>
                </div>
                <div className="app-row__controls">
                  <button type="button" className="btn btn--small btn--danger" onClick={() => handleCancella(ap.id)}>
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
