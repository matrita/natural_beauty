import { request } from './http'

export function getOrari() {
  return request('/api/config/orari')
}
