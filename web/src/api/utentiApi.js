import { request } from './http'

export function listUtenti() {
  return request('/api/utenti')
}

export function createUtente({ email, password, ruolo }) {
  return request('/api/utenti', {
    method: 'POST',
    body: JSON.stringify({ email, password, ruolo }),
  })
}

export function updateRuoloUtente(id, ruolo) {
  return request(`/api/utenti/${id}/ruolo`, {
    method: 'PATCH',
    body: JSON.stringify({ ruolo }),
  })
}

export function updatePasswordUtente(id, password) {
  return request(`/api/utenti/${id}/password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function deleteUtente(id) {
  return request(`/api/utenti/${id}`, { method: 'DELETE' })
}

