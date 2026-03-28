import { request } from './http'

export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function registerCliente({ email, password, nome, cognome, telefono }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nome, cognome, telefono: telefono || null }),
  })
}
