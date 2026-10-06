import { apiRequest } from './api'

export function getDashboardAnalytics() {
  return apiRequest('/analytics/dashboard')
}
