const TOKEN_KEY = 'nb_token'
const PROFILE_KEY = 'nb_profile'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export function getProfile() {
  const raw = sessionStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** @param {{ email: string, ruolo: string } | null} profile */
export function setProfile(profile) {
  if (profile) sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  else sessionStorage.removeItem(PROFILE_KEY)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
}
