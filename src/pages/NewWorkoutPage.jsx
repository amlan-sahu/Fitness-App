import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api'
import { createWorkout } from '../services/workouts'

const defaultWorkoutDate = new Date().toISOString().slice(0, 10)

export function NewWorkoutPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', date: defaultWorkoutDate, duration: '', notes: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      const workout = await createWorkout({ ...form, duration: form.duration ? Number(form.duration) : null })
      navigate(`/workouts/${workout.id}`)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to start this workout.')
    } finally {
      setIsSaving(false)
    }
  }

  return <section className="animate-[fade-in_400ms_ease-out]"><Link className="text-sm font-semibold text-[#527b20] hover:underline" to="/workouts">&larr; Workout history</Link><p className="mb-4 mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">New session</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">Start a workout.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">Set the context first. You can add exercises and sets on the next screen.</p>{error && <p role="alert" className="mt-6 max-w-2xl rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{error}</p>}<form className="mt-8 max-w-2xl rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7" onSubmit={handleSubmit}><div className="space-y-5"><label className="block text-sm font-semibold">Workout name<input className="mt-2 w-full rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Upper body strength" maxLength={160} required /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Date<input className="mt-2 w-full rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label><label className="block text-sm font-semibold">Duration (minutes)<input className="mt-2 w-full rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" type="number" min="0" max="1440" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></label></div><label className="block text-sm font-semibold">Notes<textarea className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} maxLength={5000} placeholder="How did this session feel?" /></label></div><button className="mt-7 rounded-xl bg-[#18221d] px-6 py-3 font-semibold text-[#e7f4c7] hover:bg-[#304232] disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? 'Starting...' : 'Continue to exercises'}</button></form></section>
}
