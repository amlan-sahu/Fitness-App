import { apiRequest } from './api'

export function requestAssistant(feature) {
  return apiRequest('/ai/assistant', { method: 'POST', body: JSON.stringify({ feature }) })
}
