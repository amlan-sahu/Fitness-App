import { apiRequest } from './api'

export function analyzeWorkoutProgress() {
  return apiRequest('/ai/workout-summary', { method: 'POST' })
}
