import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../services/api'
import { getWorkouts } from '../services/workouts'

export function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getWorkouts().then(setWorkouts).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load workout history.')).finally(() => setIsLoading(false))
  }, [])

  return <section className="animate-[fade-in_400ms_ease-out]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">Training</p><h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">Your workout history.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">Review completed sessions or pick up a workout in progress.</p></div><Link className="rounded-xl bg-[#18221d] px-5 py-3 text-center font-semibold text-[#e7f4c7] hover:bg-[#304232]" to="/workouts/new">Start a workout</Link></div>{error && <Message>{error}</Message>}{isLoading ? <Loading /> : workouts.length === 0 ? <EmptyHistory /> : <div className="mt-10 grid gap-4">{workouts.map((workout) => <WorkoutCard key={workout.id} workout={workout} />)}</div>}</section>
}

function WorkoutCard({ workout }) { return <Link to={`/workouts/${workout.id}`} className="block rounded-2xl border border-[#dfe6d9] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#91aa76] sm:p-7"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#719b35]">{formatDate(workout.date)}</p><h2 className="font-display mt-2 text-2xl font-bold text-[#18221d]">{workout.name}</h2></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${workout.completed ? 'bg-[#e7f4c7] text-[#527b20]' : 'bg-[#fff1c9] text-[#956d13]'}`}>{workout.completed ? 'Completed' : 'In progress'}</span></div><div className="mt-6 flex flex-wrap gap-5 text-sm text-[#718078]"><span>{workout.exercises.length} exercises</span><span>{formatNumber(workout.total_volume)} kg volume</span><span>{workout.duration ? `${workout.duration} min` : 'Duration not set'}</span></div></Link> }
function EmptyHistory() { return <div className="mt-10 rounded-2xl border border-dashed border-[#bac8b5] p-10 text-center"><p className="font-display text-xl font-bold">Your first session starts here.</p><p className="mt-2 text-sm text-[#718078]">Create a workout, add movements, and log your first set.</p></div> }
function Loading() { return <div className="grid min-h-64 place-items-center text-sm text-[#718078]">Loading workout history...</div> }
function Message({ children }) { return <p role="alert" className="mt-6 rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{children}</p> }
function formatDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }
function formatNumber(value) { return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }
