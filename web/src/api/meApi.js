import { request } from './http'

export function deleteMyAccount() {
  return request('/api/me/account', { method: 'DELETE' })
}

export function changeMyPassword(vecchiaPassword, nuovaPassword) {
  return request('/api/me/account/password', {
    method: 'PATCH',
    body: JSON.stringify({ vecchiaPassword, nuovaPassword }),
  })
}
