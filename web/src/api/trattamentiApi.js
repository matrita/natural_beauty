import { request } from './http'

const BASE = '/api/trattamenti'

/** @typedef {{ nome: string, durataMinuti: number, prezzo: string|number, descrizione?: string|null, attivo?: boolean|null }} TrattamentoInput */

export function listTrattamenti({ soloAttivi = false } = {}) {
  const q = soloAttivi ? '?soloAttivi=true' : ''
  return request(`${BASE}${q}`)
}

export function getTrattamento(id) {
  return request(`${BASE}/${id}`)
}

/** @param {TrattamentoInput} body */
export function createTrattamento(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) })
}

/** @param {TrattamentoInput} body */
export function updateTrattamento(id, body) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteTrattamento(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
