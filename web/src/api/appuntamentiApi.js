import { request } from './http'

const BASE = '/api/appuntamenti'
const ME_BASE = '/api/me/appuntamenti'

/** @typedef {{ clienteId: number, operatoreId: number, trattamentoId: number, dataOraInizio: string, note?: string|null }} AppuntamentoInput */

/**
 * @param {string} da ISO-8601 local or Z (es. 2026-03-28T08:00:00)
 * @param {string} a ISO-8601
 */
export function listAppuntamenti(da, a) {
  const params = new URLSearchParams({ da, a })
  return request(`${BASE}?${params}`)
}

export function getAppuntamento(id) {
  return request(`${BASE}/${id}`)
}

/** @param {AppuntamentoInput} body */
export function createAppuntamento(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) })
}

/**
 * @param {string} stato PRENOTATO | CONFERMATO | COMPLETATO | CANCELLATO
 */
export function updateStatoAppuntamento(id, stato) {
  return request(`${BASE}/${id}/stato`, {
    method: 'PATCH',
    body: JSON.stringify({ stato }),
  })
}

export function deleteAppuntamento(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}

export function listMieiAppuntamenti(da, a) {
  const params = new URLSearchParams({ da, a })
  return request(`${ME_BASE}?${params}`)
}

/** @typedef {{ operatoreId: number, trattamentoId: number, dataOraInizio: string, note?: string|null }} MioAppuntamentoInput */

/** @param {MioAppuntamentoInput} body */
export function createMioAppuntamento(body) {
  return request(ME_BASE, { method: 'POST', body: JSON.stringify(body) })
}

export function cancellaMioAppuntamento(id) {
  return request(`${ME_BASE}/${id}`, { method: 'DELETE' })
}

export function disponibilita(operatoreId, trattamentoId, da, a, stepMinuti = 15) {
  const params = new URLSearchParams({
    operatoreId: String(operatoreId),
    trattamentoId: String(trattamentoId),
    da,
    a,
    stepMinuti: String(stepMinuti),
  })
  return request(`${BASE}/disponibilita?${params}`)
}
