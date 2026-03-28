/**
 * Client HTTP condiviso: tutte le chiamate al backend passano da qui.
 * In dev Vite inoltra /api a Spring (vite.config.js).
 */
import { clearToken, getToken } from '../auth/tokenStore'

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function parseJsonSafe(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function request(path, options = {}) {
  const hadAuth = Boolean(getToken())
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }
  if (options.body != null && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(path, { ...options, headers })

  const text = await res.text()
  const data = text ? parseJsonSafe(text) : null

  // Se è 401, facciamo logout SOLO se non è un tentativo di login o un cambio password
  // (dove 401 indica credenziali errate, non sessione scaduta)
  const isLoginPath = path === '/api/auth/login'
  const isChangePasswordPath = path === '/api/me/account/password'

  if (res.status === 401 && hadAuth && !isLoginPath && !isChangePasswordPath) {
    clearToken()
    window.dispatchEvent(new CustomEvent('auth:session-expired'))
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.detail || data.title)) ||
      res.statusText ||
      `HTTP ${res.status}`
    throw new ApiError(msg, res.status, data)
  }

  if (res.status === 204) return null
  return data
}
