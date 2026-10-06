import { apiRequest } from './api'

export function getDailyNutrition(date) {
  return apiRequest(`/nutrition/daily?selected_date=${date}`)
}

export function getWeeklyNutrition(endDate) {
  return apiRequest(`/nutrition/weekly?end_date=${endDate}`)
}

export function getNutritionTargets() {
  return apiRequest('/nutrition/targets')
}

export function saveNutritionTargets(targets) {
  return apiRequest('/nutrition/targets', { method: 'PUT', body: JSON.stringify(targets) })
}

export function createNutritionEntry(entry) {
  return apiRequest('/nutrition/entries', { method: 'POST', body: JSON.stringify(entry) })
}

export function updateNutritionEntry(entryId, entry) {
  return apiRequest(`/nutrition/entries/${entryId}`, { method: 'PATCH', body: JSON.stringify(entry) })
}

export function deleteNutritionEntry(entryId) {
  return apiRequest(`/nutrition/entries/${entryId}`, { method: 'DELETE' })
}
