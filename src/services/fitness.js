import { apiRequest } from './api'

export function getProfile() {
  return apiRequest('/profile')
}

export function saveProfile(profile) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
}

export function getPrimaryGoal() {
  return apiRequest('/goals/primary')
}

export function savePrimaryGoal(goal) {
  return apiRequest('/goals/primary', {
    method: 'PUT',
    body: JSON.stringify(goal),
  })
}
