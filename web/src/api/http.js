import { clearToken, getToken } from '../auth/tokenStore'

// Rilevamento ambiente
const isNative = window.hasOwnProperty('Capacitor');
// IP AGGIORNATO: 192.168.1.17
const BASE_URL = isNative ? 'http://192.168.1.17:8080' : ''; 

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondi di timeout

  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  }
  
  if (options.body != null && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const fullPath = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  
  try {
    const res = await fetch(fullPath, { 
      ...options, 
      headers,
      signal: controller.signal 
    })
    clearTimeout(timeoutId);

    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch (e) {
      data = { message: "Errore di connessione o formato non valido" }
    }

    const isLoginPath = path.includes('/auth/login')
    const isChangePasswordPath = path.includes('/account/password')

    if (res.status === 401 && !isLoginPath && !isChangePasswordPath) {
      clearToken()
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }

    if (!res.ok) {
      throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data)
    }

    return res.status === 204 ? null : data
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connessione scaduta. Il PC (192.168.1.17) non risponde.');
    }
    throw error;
  }
}
