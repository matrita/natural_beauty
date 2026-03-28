import { request } from './http'

const BASE = '/api/operatori'

/** @typedef {{ nome: string, cognome: string, specializzazioni?: string|null, attivo?: boolean|null }} OperatoreInput */

export function listOperatori({ soloAttivi = false } = {}) {
  const q = soloAttivi ? '?soloAttivi=true' : ''
  return request(`${BASE}${q}`)
}

export function getOperatore(id) {
  return request(`${BASE}/${id}`)
}

/** @param {OperatoreInput} body */
export function createOperatore(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) })
}

/** @param {OperatoreInput} body */
export function updateOperatore(id, body) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteOperatore(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
