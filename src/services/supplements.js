import { apiRequest } from './api'

export function getSupplementDashboard(date) {
  return apiRequest(`/supplements/dashboard?selected_date=${date}`)
}

export function createSupplement(supplement) {
  return apiRequest('/supplements', { method: 'POST', body: JSON.stringify(supplement) })
}

export function updateSupplement(supplementId, supplement) {
  return apiRequest(`/supplements/${supplementId}`, { method: 'PATCH', body: JSON.stringify(supplement) })
}

export function deleteSupplement(supplementId) {
  return apiRequest(`/supplements/${supplementId}`, { method: 'DELETE' })
}

export function logSupplement(supplementId, date, taken) {
  return apiRequest(`/supplements/${supplementId}/logs/${date}`, { method: 'PUT', body: JSON.stringify({ taken }) })
}
