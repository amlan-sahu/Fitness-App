import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../services/api'
import { getStoredExercises } from '../services/exercises'
import { addWorkoutExercise, addWorkoutSet, completeWorkout, deleteWorkoutSet, getWorkout, updateWorkoutSet } from '../services/workouts'

const blankSet = { weight: '', repetitions: '', rpe: '', rest_seconds: '' }
const inputClass = 'rounded-lg border border-[#dfe6d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#719b35]'

export function WorkoutDetailPage() {
  const { workoutId } = useParams()
  const [workout, setWorkout] = useState(null)
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([getWorkout(workoutId), getStoredExercises()]).then(([loadedWorkout, exercises]) => {
      setWorkout(loadedWorkout)
      setExerciseOptions(exercises)
      setSelectedExerciseId(exercises[0]?.id || '')
    }).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load this workout.')).finally(() => setIsLoading(false))
  }, [workoutId])

  async function runAction(action, successMessage = '') {
    setError('')
    setSuccess('')
    setIsSaving(true)
    try {
      const updatedWorkout = await action()
      setWorkout(updatedWorkout)
      setSuccess(successMessage)
      return updatedWorkout
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update this workout.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddExercise(event) {
    event.preventDefault()
    if (!selectedExerciseId) return
    await runAction(() => addWorkoutExercise(workout.id, Number(selectedExerciseId)), 'Exercise added.')
  }

  async function handleComplete() {
    const completedWorkout = await runAction(() => completeWorkout(workout.id), 'Workout completed.')
    if (completedWorkout?.personal_records?.length) setSuccess(`Workout completed. Personal record: ${completedWorkout.personal_records.join(', ')}.`)
  }

  if (isLoading) return <div className="grid min-h-80 place-items-center text-sm text-[#718078]">Loading workout...</div>
  if (!workout) return <p role="alert" className="rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">Workout not found.</p>

  const availableExercises = exerciseOptions.filter((option) => !workout.exercises.some((item) => item.exercise_id === option.id))
  return <section className="animate-[fade-in_400ms_ease-out]"><Link className="text-sm font-semibold text-[#527b20] hover:underline" to="/workouts">&larr; Workout history</Link><div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">{formatDate(workout.date)}</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-5xl">{workout.name}</h1><p className="mt-3 text-sm text-[#718078]">{workout.notes || 'Add movements and record your sets below.'}</p></div><div className="flex items-center gap-3">{workout.completed ? <span className="rounded-full bg-[#e7f4c7] px-4 py-2 text-sm font-semibold text-[#527b20]">Completed</span> : <button className="rounded-xl bg-[#18221d] px-5 py-3 font-semibold text-[#e7f4c7] hover:bg-[#304232] disabled:opacity-60" disabled={isSaving} type="button" onClick={handleComplete}>Complete workout</button>}</div></div>{error && <p role="alert" className="mt-6 rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{error}</p>}{success && <p className="mt-6 rounded-xl bg-[#e7f4c7] px-4 py-3 text-sm text-[#466522]">{success}</p>}<div className="mt-8 grid gap-5 sm:grid-cols-3"><Summary label="Exercises" value={workout.exercises.length} /><Summary label="Total volume" value={`${formatNumber(workout.total_volume)} kg`} /><Summary label="Duration" value={workout.duration ? `${workout.duration} min` : 'Not set'} /></div>{!workout.completed && <form className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#dfe6d9] bg-white p-4 sm:flex-row" onSubmit={handleAddExercise}><select className="min-w-0 flex-1 rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" value={selectedExerciseId} onChange={(event) => setSelectedExerciseId(event.target.value)}><option value="">Choose an exercise</option>{availableExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select><button className="rounded-xl bg-[#d8ef9d] px-5 py-3 font-semibold text-[#18221d] hover:bg-[#c9e78a] disabled:opacity-50" disabled={!selectedExerciseId || isSaving} type="submit">Add exercise</button></form>}<div className="mt-8 space-y-5">{workout.exercises.map((workoutExercise) => <ExerciseBlock key={workoutExercise.id} workout={workout} workoutExercise={workoutExercise} disabled={workout.completed || isSaving} onUpdate={setWorkout} onError={setError} />)}{workout.exercises.length === 0 && <div className="rounded-2xl border border-dashed border-[#bac8b5] p-10 text-center text-sm text-[#718078]">Add an exercise to begin logging sets.</div>}</div></section>
}

function ExerciseBlock({ workout, workoutExercise, disabled, onUpdate, onError }) { const [newSet, setNewSet] = useState(blankSet); const [saving, setSaving] = useState(false); async function save(action) { setSaving(true); onError(''); try { onUpdate(await action()) } catch (requestError) { onError(requestError instanceof ApiError ? requestError.message : 'Unable to save this set.') } finally { setSaving(false) } } async function addSet(event) { event.preventDefault(); await save(() => addWorkoutSet(workout.id, workoutExercise.id, numericSet(newSet))); setNewSet(blankSet) } return <section className="rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl font-bold">{workoutExercise.exercise_name}</h2><p className="mt-1 text-sm text-[#718078]">{workoutExercise.muscle_group} <span className="px-1 text-[#bac8b5]">/</span> {formatNumber(workoutExercise.volume)} kg volume</p></div><span className="text-sm font-semibold text-[#719b35]">{workoutExercise.sets.length} sets</span></div><div className="mt-6 space-y-3">{workoutExercise.sets.map((set) => <SetRow key={set.id} workout={workout} workoutExercise={workoutExercise} set={set} disabled={disabled || saving} onUpdate={onUpdate} onError={onError} />)}</div>{!disabled && <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]" onSubmit={addSet}><input className={inputClass} type="number" min="0" step="0.1" placeholder="Weight kg" value={newSet.weight} onChange={(event) => setNewSet({ ...newSet, weight: event.target.value })} required /><input className={inputClass} type="number" min="1" placeholder="Reps" value={newSet.repetitions} onChange={(event) => setNewSet({ ...newSet, repetitions: event.target.value })} required /><input className={inputClass} type="number" min="1" max="10" step="0.5" placeholder="RPE" value={newSet.rpe} onChange={(event) => setNewSet({ ...newSet, rpe: event.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Rest sec" value={newSet.rest_seconds} onChange={(event) => setNewSet({ ...newSet, rest_seconds: event.target.value })} /><button className="rounded-lg bg-[#18221d] px-4 py-2 text-sm font-semibold text-[#e7f4c7] disabled:opacity-50" disabled={saving} type="submit">Add set</button></form>}</section> }

function SetRow({ workout, workoutExercise, set, disabled, onUpdate, onError }) { const [form, setForm] = useState({ weight: set.weight, repetitions: set.repetitions, rpe: set.rpe ?? '', rest_seconds: set.rest_seconds ?? '' }); const [editing, setEditing] = useState(false); const [saving, setSaving] = useState(false); async function save(action) { setSaving(true); onError(''); try { onUpdate(await action()); setEditing(false) } catch (requestError) { onError(requestError instanceof ApiError ? requestError.message : 'Unable to update this set.') } finally { setSaving(false) } } const payload = numericSet(form); return <div className="rounded-xl border border-[#edf0e8] bg-[#f8faf5] p-3"><div className="flex flex-wrap items-center gap-4 text-sm"><span className="w-12 font-mono text-xs text-[#9cad9a]">SET {set.set_number}</span>{editing ? <><input className={inputClass} type="number" min="0" step="0.1" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /><input className={inputClass} type="number" min="1" value={form.repetitions} onChange={(event) => setForm({ ...form, repetitions: event.target.value })} /><input className={inputClass} type="number" min="1" max="10" step="0.5" value={form.rpe} placeholder="RPE" onChange={(event) => setForm({ ...form, rpe: event.target.value })} /><button className="font-semibold text-[#527b20]" type="button" disabled={saving} onClick={() => save(() => updateWorkoutSet(workout.id, workoutExercise.id, set.id, payload))}>Save</button></> : <><span className="font-semibold text-[#18221d]">{set.weight} kg x {set.repetitions}</span><span className="text-[#718078]">{set.rpe ? `RPE ${set.rpe}` : 'RPE not set'}</span><span className="text-[#719b35]">{formatNumber(set.volume)} kg volume</span><div className="ml-auto flex gap-3"><button className="text-xs font-semibold text-[#527b20] hover:underline disabled:opacity-50" type="button" disabled={disabled} onClick={() => setEditing(true)}>Edit</button><button className="text-xs font-semibold text-[#a43b25] hover:underline disabled:opacity-50" type="button" disabled={disabled} onClick={() => save(() => deleteWorkoutSet(workout.id, workoutExercise.id, set.id))}>Delete</button></div></>}</div></div> }
function Summary({ label, value }) { return <div className="rounded-2xl border border-[#dfe6d9] bg-white p-5"><p className="text-sm text-[#718078]">{label}</p><p className="mt-3 font-display text-2xl font-bold">{value}</p></div> }
function numericSet(set) { return { weight: Number(set.weight), repetitions: Number(set.repetitions), rpe: set.rpe === '' ? null : Number(set.rpe), rest_seconds: set.rest_seconds === '' ? null : Number(set.rest_seconds) } }
function formatDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }
function formatNumber(value) { return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }
