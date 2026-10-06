import { apiRequest } from './api'

function buildQuery(filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getExercises(filters = {}) {
  return apiRequest(`/exercises/external${buildQuery(filters)}`)
}

export function getStoredExercises(filters = {}) {
  return apiRequest(`/exercises${buildQuery(filters)}`)
}
