import { apiRequest } from './api'

export function getWorkouts() {
  return apiRequest('/workouts')
}

export function getWorkout(workoutId) {
  return apiRequest(`/workouts/${workoutId}`)
}

export function createWorkout(workout) {
  return apiRequest('/workouts', { method: 'POST', body: JSON.stringify(workout) })
}

export function addWorkoutExercise(workoutId, exerciseId) {
  return apiRequest(`/workouts/${workoutId}/exercises`, { method: 'POST', body: JSON.stringify({ exercise_id: exerciseId }) })
}

export function addWorkoutSet(workoutId, workoutExerciseId, set) {
  return apiRequest(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`, { method: 'POST', body: JSON.stringify(set) })
}

export function updateWorkoutSet(workoutId, workoutExerciseId, setId, set) {
  return apiRequest(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`, { method: 'PATCH', body: JSON.stringify(set) })
}

export function deleteWorkoutSet(workoutId, workoutExerciseId, setId) {
  return apiRequest(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`, { method: 'DELETE' })
}

export function completeWorkout(workoutId) {
  return apiRequest(`/workouts/${workoutId}/complete`, { method: 'POST' })
}
