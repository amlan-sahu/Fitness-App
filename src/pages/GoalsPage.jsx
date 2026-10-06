import { useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { getPrimaryGoal, savePrimaryGoal } from '../services/fitness'

const initialGoal = { goal_type: 'fat_loss', current_weight_kg: '', target_weight_kg: '', target_date: '', description: '' }
const goalOptions = [['fat_loss', 'Fat loss'], ['muscle_gain', 'Muscle gain'], ['strength', 'Strength'], ['maintenance', 'Maintenance'], ['general_fitness', 'General fitness']]
const inputClass = 'mt-2 w-full rounded-xl border border-[#dfe6d9] bg-white px-4 py-3 outline-none transition focus:border-[#719b35]'

export function GoalsPage() {
  const [form, setForm] = useState(initialGoal)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getPrimaryGoal().then((goal) => goal && setForm({ ...goal, target_date: goal.target_date || '' })).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }, [])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!form.target_date || new Date(`${form.target_date}T00:00:00`) <= new Date()) {
      setError('Choose a target date in the future.')
      return
    }
    setIsSaving(true)
    try {
      await savePrimaryGoal({ ...form, current_weight_kg: Number(form.current_weight_kg), target_weight_kg: Number(form.target_weight_kg) })
      setSuccess('Primary goal saved successfully.')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save your goal.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="grid min-h-80 place-items-center text-sm text-[#718078]">Loading your goal...</div>

  return (
    <section className="animate-[fade-in_400ms_ease-out]">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">Goals</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">Give your effort a direction.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">Choose one primary goal and define what progress looks like for you.</p>
      {error && <Message tone="error">{error}</Message>}
      {success && <Message tone="success">{success}</Message>}
      <form className="mt-8 max-w-4xl rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Primary goal<select className={inputClass} name="goal_type" value={form.goal_type} onChange={updateField}>{goalOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-semibold">Current weight (kg)<input className={inputClass} name="current_weight_kg" type="number" min="1" max="500" step="0.1" value={form.current_weight_kg} onChange={updateField} required /></label>
          <label className="text-sm font-semibold">Target weight (kg)<input className={inputClass} name="target_weight_kg" type="number" min="1" max="500" step="0.1" value={form.target_weight_kg} onChange={updateField} required /></label>
          <label className="text-sm font-semibold">Target date<input className={inputClass} name="target_date" type="date" value={form.target_date} onChange={updateField} required /></label>
          <label className="text-sm font-semibold sm:col-span-2">Goal description<textarea className={`${inputClass} min-h-32 resize-y`} name="description" value={form.description} onChange={updateField} maxLength={1000} placeholder="What would reaching this goal make possible?" /></label>
        </div>
        <button className="mt-7 rounded-xl bg-[#18221d] px-6 py-3 font-semibold text-[#e7f4c7] transition hover:bg-[#304232] disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save primary goal'}</button>
      </form>
    </section>
  )
}

function Message({ tone, children }) { return <p role="alert" className={`mt-6 rounded-xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-[#ffe4dc] text-[#a43b25]' : 'bg-[#e7f4c7] text-[#466522]'}`}>{children}</p> }
