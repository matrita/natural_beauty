import { request } from './http'

const BASE = '/api/clienti'

/** @typedef {{ nome: string, cognome: string, email: string, telefono?: string|null, note?: string|null }} ClienteInput */

export function listClienti() {
  return request(BASE)
}

export function getCliente(id) {
  return request(`${BASE}/${id}`)
}

/** @param {ClienteInput} body */
export function createCliente(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) })
}

/** @param {ClienteInput} body */
export function updateCliente(id, body) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteCliente(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
