import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ApiError } from '../services/api'
import { createNutritionEntry, deleteNutritionEntry, getDailyNutrition, getNutritionTargets, getWeeklyNutrition, saveNutritionTargets, updateNutritionEntry } from '../services/nutrition'

const today = new Date().toISOString().slice(0, 10)
const blankEntry = { food_name: '', meal_type: 'breakfast', serving_size: '', calories: '', protein: '', carbohydrates: '', fat: '', fiber: '' }
const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
const inputClass = 'mt-2 w-full rounded-xl border border-[#dfe6d9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#719b35]'

export function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(today)
  const [daily, setDaily] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [targets, setTargets] = useState(null)
  const [entryForm, setEntryForm] = useState(blankEntry)
  const [editingId, setEditingId] = useState(null)
  const [targetForm, setTargetForm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData(date = selectedDate) {
    setError('')
    try {
      const [dailyData, weeklyData, targetData] = await Promise.all([getDailyNutrition(date), getWeeklyNutrition(date), getNutritionTargets()])
      setDaily(dailyData)
      setWeekly(weeklyData.days)
      setTargets(targetData)
      setTargetForm(targetData)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load nutrition data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([getDailyNutrition(today), getWeeklyNutrition(today), getNutritionTargets()]).then(([dailyData, weeklyData, targetData]) => {
      setDaily(dailyData)
      setWeekly(weeklyData.days)
      setTargets(targetData)
      setTargetForm(targetData)
    }).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load nutrition data.')).finally(() => setIsLoading(false))
  }, [])

  async function refreshDay() { await loadData(selectedDate) }

  async function handleEntrySubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)
    const payload = { ...entryForm, date: selectedDate, calories: Number(entryForm.calories), protein: Number(entryForm.protein), carbohydrates: Number(entryForm.carbohydrates), fat: Number(entryForm.fat), fiber: Number(entryForm.fiber) }
    try {
      if (editingId) await updateNutritionEntry(editingId, payload)
      else await createNutritionEntry(payload)
      setEntryForm(blankEntry)
      setEditingId(null)
      setSuccess(editingId ? 'Food entry updated.' : 'Food entry added.')
      await refreshDay()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save this food entry.')
    } finally { setIsSaving(false) }
  }

  async function handleDelete(entryId) {
    setError('')
    setSuccess('')
    try { await deleteNutritionEntry(entryId); setSuccess('Food entry deleted.'); await refreshDay() } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Unable to delete this food entry.') }
  }

  async function handleTargetSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)
    try { const savedTargets = await saveNutritionTargets({ calories: Number(targetForm.calories), protein: Number(targetForm.protein), carbohydrates: Number(targetForm.carbohydrates), fat: Number(targetForm.fat) }); setTargets(savedTargets); setTargetForm(savedTargets); setSuccess('Daily targets saved.') } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Unable to save daily targets.') } finally { setIsSaving(false) }
  }

  function beginEdit(entry) { setEditingId(entry.id); setEntryForm({ food_name: entry.food_name, meal_type: entry.meal_type, serving_size: entry.serving_size, calories: entry.calories, protein: entry.protein, carbohydrates: entry.carbohydrates, fat: entry.fat, fiber: entry.fiber }); setSuccess('') }

  if (isLoading) return <div className="grid min-h-80 place-items-center text-sm text-[#718078]">Loading nutrition...</div>
  return <section className="animate-[fade-in_400ms_ease-out]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">Nutrition</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">Fuel the work.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">Log meals, see your daily totals, and keep your intake in view.</p></div><label className="text-sm font-semibold">Log date<input className="mt-2 rounded-xl border border-[#dfe6d9] bg-white px-4 py-3 font-normal outline-none focus:border-[#719b35]" type="date" value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setIsLoading(true); loadData(event.target.value) }} /></label></div>{error && <Message tone="error">{error}</Message>}{success && <Message tone="success">{success}</Message>}<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MacroCard label="Calories" value={daily.totals.calories} target={targets.calories} unit="kcal" color="#719b35" /><MacroCard label="Protein" value={daily.totals.protein} target={targets.protein} unit="g" color="#527b20" /><MacroCard label="Carbs" value={daily.totals.carbohydrates} target={targets.carbohydrates} unit="g" color="#b98b2e" /><MacroCard label="Fat" value={daily.totals.fat} target={targets.fat} unit="g" color="#9b5d45" /></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><section className="rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><h2 className="font-display text-xl font-bold">Food entries</h2><p className="mt-1 text-sm text-[#718078]">{formatDate(selectedDate)}</p></div>{editingId && <button className="text-sm font-semibold text-[#527b20] hover:underline" type="button" onClick={() => { setEditingId(null); setEntryForm(blankEntry) }}>Cancel edit</button>}</div><form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={handleEntrySubmit}><Field label="Food name"><input className={inputClass} value={entryForm.food_name} onChange={(event) => setEntryForm({ ...entryForm, food_name: event.target.value })} required /></Field><Field label="Meal type"><select className={inputClass} value={entryForm.meal_type} onChange={(event) => setEntryForm({ ...entryForm, meal_type: event.target.value })}>{Object.entries(mealLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Serving size"><input className={inputClass} value={entryForm.serving_size} onChange={(event) => setEntryForm({ ...entryForm, serving_size: event.target.value })} placeholder="e.g. 1 bowl" required /></Field><Field label="Calories"><input className={inputClass} type="number" min="0" value={entryForm.calories} onChange={(event) => setEntryForm({ ...entryForm, calories: event.target.value })} required /></Field><Field label="Protein (g)"><input className={inputClass} type="number" min="0" step="0.1" value={entryForm.protein} onChange={(event) => setEntryForm({ ...entryForm, protein: event.target.value })} required /></Field><Field label="Carbohydrates (g)"><input className={inputClass} type="number" min="0" step="0.1" value={entryForm.carbohydrates} onChange={(event) => setEntryForm({ ...entryForm, carbohydrates: event.target.value })} required /></Field><Field label="Fat (g)"><input className={inputClass} type="number" min="0" step="0.1" value={entryForm.fat} onChange={(event) => setEntryForm({ ...entryForm, fat: event.target.value })} required /></Field><Field label="Fiber (g)"><input className={inputClass} type="number" min="0" step="0.1" value={entryForm.fiber} onChange={(event) => setEntryForm({ ...entryForm, fiber: event.target.value })} required /></Field><button className="rounded-xl bg-[#18221d] px-4 py-3 font-semibold text-[#e7f4c7] hover:bg-[#304232] disabled:opacity-60 sm:col-span-2" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : editingId ? 'Update food' : 'Add food'}</button></form><div className="mt-8 space-y-3">{daily.entries.length ? daily.entries.map((entry) => <EntryRow key={entry.id} entry={entry} onEdit={() => beginEdit(entry)} onDelete={() => handleDelete(entry.id)} />) : <p className="rounded-xl border border-dashed border-[#bac8b5] p-6 text-center text-sm text-[#718078]">No food logged for this day.</p>}</div></section><div className="space-y-5"><section className="rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7"><h2 className="font-display text-xl font-bold">Daily targets</h2><p className="mt-1 text-sm text-[#718078]">These limits power the progress bars.</p>{targetForm && <form className="mt-5 grid grid-cols-2 gap-3" onSubmit={handleTargetSubmit}>{[['calories', 'Calories'], ['protein', 'Protein (g)'], ['carbohydrates', 'Carbs (g)'], ['fat', 'Fat (g)']].map(([name, label]) => <Field key={name} label={label}><input className={inputClass} type="number" min="1" step="0.1" value={targetForm[name]} onChange={(event) => setTargetForm({ ...targetForm, [name]: event.target.value })} required /></Field>)}<button className="rounded-xl border border-[#719b35] px-4 py-2 text-sm font-semibold text-[#527b20] hover:bg-[#eff7dd] sm:col-span-2" type="submit" disabled={isSaving}>Save targets</button></form>}</section><section className="rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7"><h2 className="font-display text-xl font-bold">Weekly nutrition</h2><p className="mt-1 text-sm text-[#718078]">Calories logged over the selected week.</p><div className="mt-6 h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly}><CartesianGrid stroke="#edf0e8" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })} /><YAxis tick={{ fontSize: 10 }} width={42} /><Tooltip /><Bar dataKey="totals.calories" name="Calories" fill="#719b35" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></section></div></div></section>
}

function MacroCard({ label, value, target, unit, color }) { const percent = Math.min(100, target ? (value / target) * 100 : 0); return <div className="rounded-2xl border border-[#dfe6d9] bg-white p-5"><div className="flex justify-between gap-3 text-sm"><span className="text-[#718078]">{label}</span><span className="font-semibold">{formatNumber(value)} / {formatNumber(target)} {unit}</span></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#edf0e8]"><div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} /></div></div> }
function EntryRow({ entry, onEdit, onDelete }) { return <div className="flex flex-col gap-3 rounded-xl border border-[#edf0e8] bg-[#f8faf5] p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-semibold">{entry.food_name}</p><p className="mt-1 text-xs text-[#718078]">{mealLabels[entry.meal_type]} / {entry.serving_size}</p></div><div className="flex items-center gap-4 text-sm text-[#718078]"><span>{entry.calories} kcal</span><span>{formatNumber(entry.protein)}g protein</span><button className="text-xs font-semibold text-[#527b20] hover:underline" type="button" onClick={onEdit}>Edit</button><button className="text-xs font-semibold text-[#a43b25] hover:underline" type="button" onClick={onDelete}>Delete</button></div></div> }
function Field({ label, children }) { return <label className="block text-sm font-semibold">{label}{children}</label> }
function Message({ tone, children }) { return <p role="alert" className={`mt-6 rounded-xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-[#ffe4dc] text-[#a43b25]' : 'bg-[#e7f4c7] text-[#466522]'}`}>{children}</p> }
function formatNumber(value) { return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }
function formatDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) }
