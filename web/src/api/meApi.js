import { request } from './http'

export function deleteMyAccount() {
  return request('/api/me/account', { method: 'DELETE' })
}

