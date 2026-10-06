import { useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { getProfile, saveProfile } from '../services/fitness'

const initialProfile = {
  name: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  gender: '',
  fitness_level: '',
  training_experience: '',
  preferred_training_days: [],
}
const trainingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const inputClass = 'mt-2 w-full rounded-xl border border-[#dfe6d9] bg-white px-4 py-3 outline-none transition focus:border-[#719b35]'

function toFormValues(profile) {
  return profile ? { ...initialProfile, ...profile, age: profile.age ?? '', height_cm: profile.height_cm ?? '', weight_kg: profile.weight_kg ?? '' } : initialProfile
}

export function ProfilePage() {
  const [form, setForm] = useState(initialProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProfile().then((profile) => setForm(toFormValues(profile))).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSuccess('')
  }

  function toggleTrainingDay(day) {
    setForm((current) => ({ ...current, preferred_training_days: current.preferred_training_days.includes(day) ? current.preferred_training_days.filter((item) => item !== day) : [...current.preferred_training_days, day] }))
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)
    try {
      await saveProfile({ ...form, age: form.age ? Number(form.age) : null, height_cm: form.height_cm ? Number(form.height_cm) : null, weight_kg: form.weight_kg ? Number(form.weight_kg) : null, gender: form.gender || null })
      setSuccess('Profile saved successfully.')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading your profile..." />

  return (
    <section className="animate-[fade-in_400ms_ease-out]">
      <PageIntro eyebrow="Profile" title="Make your plan personal." description="A few details help FitTrack understand where you are starting from." />
      {error && <Message tone="error">{error}</Message>}
      {success && <Message tone="success">{success}</Message>}
      <form className="mt-8 max-w-4xl space-y-8" onSubmit={handleSubmit}>
        <FormSection title="About you">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name"><input className={inputClass} name="name" value={form.name} onChange={updateField} maxLength={120} /></Field>
            <Field label="Gender (optional)"><select className={inputClass} name="gender" value={form.gender} onChange={updateField}><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option><option value="other">Other</option></select></Field>
            <Field label="Age"><input className={inputClass} name="age" type="number" min="13" max="120" value={form.age} onChange={updateField} /></Field>
            <Field label="Height (cm)"><input className={inputClass} name="height_cm" type="number" min="1" max="300" step="0.1" value={form.height_cm} onChange={updateField} /></Field>
            <Field label="Current weight (kg)"><input className={inputClass} name="weight_kg" type="number" min="1" max="500" step="0.1" value={form.weight_kg} onChange={updateField} /></Field>
          </div>
        </FormSection>
        <FormSection title="Training background">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Fitness level"><select className={inputClass} name="fitness_level" value={form.fitness_level} onChange={updateField}><option value="">Select a level</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></Field>
            <Field label="Training experience"><input className={inputClass} name="training_experience" value={form.training_experience} onChange={updateField} maxLength={80} placeholder="e.g. 2 years of strength training" /></Field>
          </div>
          <fieldset className="mt-6"><legend className="text-sm font-semibold">Preferred training days</legend><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><label className="sr-only">Choose preferred training days</label>{trainingDays.map((day) => <label key={day} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#dfe6d9] bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.preferred_training_days.includes(day)} onChange={() => toggleTrainingDay(day)} />{day}</label>)}</div></fieldset>
        </FormSection>
        <button className="rounded-xl bg-[#18221d] px-6 py-3 font-semibold text-[#e7f4c7] transition hover:bg-[#304232] disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </section>
  )
}

function PageIntro({ eyebrow, title, description }) { return <><p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">{eyebrow}</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">{title}</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">{description}</p></> }
function FormSection({ title, children }) { return <section className="rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7"><h2 className="font-display text-xl font-bold">{title}</h2>{children}</section> }
function Field({ label, children }) { return <label className="block text-sm font-semibold">{label}{children}</label> }
function Message({ tone, children }) { return <p role="alert" className={`mt-6 rounded-xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-[#ffe4dc] text-[#a43b25]' : 'bg-[#e7f4c7] text-[#466522]'}`}>{children}</p> }
function LoadingState({ label }) { return <div className="grid min-h-80 place-items-center text-sm text-[#718078]">{label}</div> }
