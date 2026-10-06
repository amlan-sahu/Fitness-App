import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ApiError } from '../services/api'
import { analyzeWorkoutProgress } from '../services/ai'
import { getDashboardAnalytics } from '../services/analytics'

const card = 'rounded-2xl border border-[#dfe6d9] bg-white p-5 sm:p-7'

export function DashboardPage() {
  const [analytics, setAnalytics] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [analysisError, setAnalysisError] = useState('')

  useEffect(() => {
    getDashboardAnalytics().then(setAnalytics).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'We could not load your progress analytics.')).finally(() => setIsLoading(false))
  }, [])

  async function handleAnalyzeTraining() {
    setAnalysisError('')
    setIsAnalyzing(true)
    try {
      setAnalysis(await analyzeWorkoutProgress())
    } catch (requestError) {
      setAnalysisError(requestError instanceof ApiError ? requestError.message : 'Unable to analyze your training right now.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) return <div className="grid min-h-80 place-items-center text-sm text-[#718078]">Loading your progress...</div>
  if (error) return <p role="alert" className="rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{error}</p>

  const { summary } = analytics
  return <section className="animate-[fade-in_400ms_ease-out]"><p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">Dashboard</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">Your progress, in focus.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">A clear view of the work you have logged and the changes it is creating.</p><button className="mt-6 rounded-xl bg-[#18221d] px-5 py-3 font-semibold text-[#e7f4c7] hover:bg-[#304232] disabled:opacity-60" type="button" onClick={handleAnalyzeTraining} disabled={isAnalyzing}>{isAnalyzing ? 'Analyzing...' : 'Analyze my training'}</button>{analysisError && <p role="alert" className="mt-4 rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{analysisError}</p>}{analysis && <AnalysisPanel analysis={analysis} />}<div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Summary label="Total workouts" value={summary.total_workouts} detail={`${summary.weekly_workout_count} this week`} /><Summary label="Training volume" value={`${number(summary.total_training_volume)} kg`} detail={`${summary.total_workout_duration} total minutes`} /><Summary label="Current weight" value={summary.current_weight ? `${number(summary.current_weight)} kg` : 'Not set'} detail={summary.target_weight ? `Target ${number(summary.target_weight)} kg` : 'Update your profile'} /><Summary label="Average duration" value={`${number(summary.average_workout_duration)} min`} detail="Completed workouts" /></div><div className="mt-5 grid gap-5 xl:grid-cols-2"><Chart title="Body weight over time"><LineChart data={analytics.body_weight}><Axes /><Line type="monotone" dataKey="value" stroke="#719b35" strokeWidth={3} /></LineChart></Chart><Chart title="Workout frequency"><BarChart data={analytics.workout_frequency}><Axes /><Bar dataKey="value" fill="#719b35" radius={[5, 5, 0, 0]} /></BarChart></Chart><Chart title="Training volume"><BarChart data={analytics.training_volume}><Axes /><Bar dataKey="value" fill="#18221d" radius={[5, 5, 0, 0]} /></BarChart></Chart><Chart title="Exercise strength progression"><LineChart data={analytics.strength_progression}><Axes /><Line type="monotone" dataKey="weight" stroke="#527b20" strokeWidth={3} /></LineChart></Chart></div><div className="mt-5 grid gap-5 xl:grid-cols-2"><section className={card}><h2 className="font-display text-xl font-bold">Recent workouts</h2><div className="mt-5 space-y-3">{analytics.recent_workouts.length ? analytics.recent_workouts.map((workout) => <Link className="flex items-center justify-between rounded-xl border border-[#edf0e8] p-3 hover:border-[#91aa76]" key={workout.id} to={`/workouts/${workout.id}`}><span><b>{workout.name}</b><small className="mt-1 block text-[#718078]">{shortDate(workout.date)} / {workout.exercise_count} exercises</small></span><span className="text-sm font-semibold text-[#527b20]">{number(workout.total_volume)} kg</span></Link>) : <Empty label="No completed workouts yet." />}</div></section><section className={card}><h2 className="font-display text-xl font-bold">Recent personal records</h2><div className="mt-5 space-y-3">{analytics.recent_personal_records.length ? analytics.recent_personal_records.map((record, index) => <div className="flex items-center justify-between rounded-xl bg-[#eff7dd] p-3" key={`${record.exercise_name}-${record.date}-${index}`}><span><b>{record.exercise_name}</b><small className="mt-1 block text-[#718078]">{shortDate(record.date)}</small></span><b className="text-[#527b20]">{number(record.weight)} kg</b></div>) : <Empty label="Your next PR will appear here." />}</div></section></div></section>
}

function AnalysisPanel({ analysis }) { return <section className={`${card} mt-5 border-[#91aa76] bg-[#eff7dd]`}><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#719b35]">AI training summary</p><h2 className="font-display mt-2 text-2xl font-bold">A structured read on your recent work.</h2></div><span className="text-xs font-semibold text-[#527b20]">General guidance</span></div><p className="mt-5 leading-7 text-[#304232]">{analysis.summary}</p><div className="mt-6 grid gap-5 md:grid-cols-3"><AnalysisList title="Positive observations" items={analysis.strengths} /><AnalysisList title="Areas to improve" items={analysis.areas_to_improve} /><AnalysisList title="General suggestions" items={analysis.suggestions} /></div></section> }
function AnalysisList({ title, items }) { return <div><h3 className="text-sm font-bold">{title}</h3>{items.length ? <ul className="mt-3 space-y-2 text-sm leading-6 text-[#466044]">{items.map((item, index) => <li key={`${title}-${index}`}>• {item}</li>)}</ul> : <p className="mt-3 text-sm text-[#718078]">No items returned.</p>}</div> }
function Summary({ label, value, detail }) { return <div className={card}><p className="text-sm text-[#718078]">{label}</p><p className="mt-5 font-display text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-[#9cad9a]">{detail}</p></div> }
function Chart({ title, children }) { return <section className={card}><h2 className="font-display text-xl font-bold">{title}</h2><div className="mt-6 h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></section> }
function Axes() { return <><CartesianGrid stroke="#edf0e8" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={shortDate} /><YAxis tick={{ fontSize: 11 }} width={42} /><Tooltip /></> }
function Empty({ label }) { return <p className="py-6 text-sm text-[#9cad9a]">{label}</p> }
function number(value) { return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }
function shortDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
