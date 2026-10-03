import { clearToken, getToken } from '../auth/tokenStore'

// Rilevamento ambiente
const isNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNative
// In native app we fallback to a default API URL or localhost if not set in VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || ''; 

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
      data = text ? { message: text } : null
    }

    const isLoginPath = path.includes('/auth/login')
    const isChangePasswordPath = path.includes('/account/password')

    if (res.status === 401 && !isLoginPath && !isChangePasswordPath) {
      clearToken()
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }

    if (!res.ok) {
      const errMsg = (typeof data?.message === 'string' && data.message)
        ? data.message
        : (typeof data === 'string' ? data : (text || `HTTP ${res.status}`))
      throw new ApiError(errMsg, res.status, data)
    }

    return res.status === 204 ? null : data
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connessione scaduta. Il server non risponde.');
    }
    throw error;
  }
}
