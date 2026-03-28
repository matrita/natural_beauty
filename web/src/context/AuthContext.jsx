import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import { clearToken, getProfile, getToken, setProfile, setToken as persistToken } from '../auth/tokenStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getProfile())

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const t = getToken()
    let p = getProfile()
    if (t && !p) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]))
        const raw = String(payload.roles || '').trim()
        const firstRole = raw
          .split(/\s+/)
          .map((r) => r.replace(/^ROLE_/i, ''))
          .find(Boolean)
        const ruolo = firstRole || 'CLIENTE'
        p = { email: payload.sub, ruolo }
        setProfile(p)
        setUser(p)
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    function onExpired() {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:session-expired', onExpired)
    return () => window.removeEventListener('auth:session-expired', onExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    persistToken(res.token)
    const profile = { email: res.email, ruolo: res.ruolo }
    setProfile(profile)
    setToken(res.token)
    setUser(profile)
    return res
  }, [])

  const register = useCallback(async (payload) => {
    const res = await authApi.registerCliente(payload)
    persistToken(res.token)
    const profile = { email: res.email, ruolo: res.ruolo }
    setProfile(profile)
    setToken(res.token)
    setUser(profile)
    return res
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
