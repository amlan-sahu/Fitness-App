import { useState } from 'react'
import { ApiError } from '../services/api'
import { requestAssistant } from '../services/assistant'

const features = [
  ['workout_suggestions', 'Workout suggestions', 'Ideas based on your logged training and progress.'],
  ['meal_suggestions', 'Meal suggestions', 'General meal ideas based on your stored targets.'],
  ['progress_explanation', 'Progress explanation', 'A plain-language read of your recent trends.'],
  ['weekly_summary', 'Weekly training summary', 'A concise review of your recent week.'],
]

export function AssistantPage() {
  const [selectedFeature, setSelectedFeature] = useState('weekly_summary')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRequest() {
    setError('')
    setIsLoading(true)
    try { setResult(await requestAssistant(selectedFeature)) } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : 'Unable to generate assistance right now.') } finally { setIsLoading(false) }
  }

  return <section className="animate-[fade-in_400ms_ease-out]"><p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">FitTrack AI</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">A useful second perspective.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#718078] sm:text-lg">Choose an assistance mode. Results use your structured app data and are presented as drafts for your review.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{features.map(([value, title, description]) => <button key={value} type="button" onClick={() => setSelectedFeature(value)} className={`text-left rounded-2xl border p-5 transition ${selectedFeature === value ? 'border-[#719b35] bg-[#eff7dd]' : 'border-[#dfe6d9] bg-white hover:border-[#91aa76]'}`}><h2 className="font-display text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[#718078]">{description}</p></button>)}</div><button className="mt-6 rounded-xl bg-[#18221d] px-6 py-3 font-semibold text-[#e7f4c7] hover:bg-[#304232] disabled:opacity-60" type="button" onClick={handleRequest} disabled={isLoading}>{isLoading ? 'Preparing your draft...' : 'Generate assistance'}</button>{error && <p role="alert" className="mt-6 rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{error}</p>}{result && <AssistantResult result={result} />}</section>
}

function AssistantResult({ result }) { return <section className="mt-8 rounded-2xl border border-[#91aa76] bg-[#eff7dd] p-5 sm:p-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#719b35]">Draft for review</p><h2 className="font-display mt-2 text-3xl font-bold">{labelFor(result.feature)}</h2></div><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#527b20]">Nothing was saved</span></div><p className="mt-6 max-w-3xl leading-7 text-[#304232]">{result.summary}</p><div className="mt-7 grid gap-6 md:grid-cols-2">{result.items.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-xl bg-white/70 p-4"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#466044]">{item.detail}</p></div>)}</div>{result.next_steps.length > 0 && <div className="mt-7"><h3 className="font-semibold">Next steps to consider</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#466044]">{result.next_steps.map((step, index) => <li key={index}>• {step}</li>)}</ul></div>}<p className="mt-7 border-t border-[#b8d580] pt-5 text-xs leading-5 text-[#718078]">{result.disclaimer}</p></section> }
function labelFor(feature) { return { workout_suggestions: 'Workout suggestions', meal_suggestions: 'Meal suggestions', progress_explanation: 'Progress explanation', weekly_summary: 'Weekly training summary' }[feature] }
