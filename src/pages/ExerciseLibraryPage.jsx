import { useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { getExercises } from '../services/exercises'

const muscleGroups = ['All muscle groups', 'Back', 'Biceps', 'Chest', 'Legs', 'Shoulders']
const equipmentOptions = ['All equipment', 'Barbell', 'Bodyweight', 'Dumbbells']

export function ExerciseLibraryPage() {
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [equipment, setEquipment] = useState('')
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadExercises(filters = { search, muscle_group: muscleGroup, equipment }) {
    try {
      const results = await getExercises(filters)
      setExercises(results)
      setSelectedExercise((current) => results.find((exercise) => exercise.id === current?.id) || results[0] || null)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load the exercise library.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getExercises()
      .then((results) => {
        setExercises(results)
        setSelectedExercise(results[0] || null)
      })
      .catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Unable to load the exercise library.'))
      .finally(() => setIsLoading(false))
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    loadExercises()
  }

  function clearFilters() {
    setError('')
    setSearch('')
    setMuscleGroup('')
    setEquipment('')
    setIsLoading(true)
    loadExercises({ search: '', muscle_group: '', equipment: '' })
  }

  return (
    <section className="animate-[fade-in_400ms_ease-out]">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">Exercise library</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-[#18221d] sm:text-6xl">Find your next movement.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#718078] sm:text-lg">Explore the movement library by muscle group, equipment, or name.</p>

      <form className="mt-8 grid gap-3 rounded-2xl border border-[#dfe6d9] bg-white p-4 sm:grid-cols-[1fr_190px_190px_auto]" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="exercise-search">Search exercises</label>
        <input id="exercise-search" className="rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" placeholder="Search exercises..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <label className="sr-only" htmlFor="muscle-filter">Filter by muscle group</label>
        <select id="muscle-filter" className="rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value)}>{muscleGroups.map((option) => <option key={option} value={option === 'All muscle groups' ? '' : option}>{option}</option>)}</select>
        <label className="sr-only" htmlFor="equipment-filter">Filter by equipment</label>
        <select id="equipment-filter" className="rounded-xl border border-[#dfe6d9] px-4 py-3 outline-none focus:border-[#719b35]" value={equipment} onChange={(event) => setEquipment(event.target.value)}>{equipmentOptions.map((option) => <option key={option} value={option === 'All equipment' ? '' : option}>{option}</option>)}</select>
        <button className="rounded-xl bg-[#18221d] px-5 py-3 font-semibold text-[#e7f4c7] hover:bg-[#304232]" type="submit">Search</button>
      </form>
      <button type="button" className="mt-3 text-sm font-semibold text-[#527b20] hover:underline" onClick={clearFilters}>Clear filters</button>

      {error && <p role="alert" className="mt-6 rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{error}</p>}
      {isLoading ? <div className="grid min-h-64 place-items-center text-sm text-[#718078]">Loading exercises...</div> : <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 sm:grid-cols-2">{exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} isSelected={selectedExercise?.id === exercise.id} onSelect={() => setSelectedExercise(exercise)} />)}{exercises.length === 0 && <p className="rounded-2xl border border-dashed border-[#bac8b5] p-8 text-sm text-[#718078] sm:col-span-2">No exercises match those filters.</p>}</div>
        {selectedExercise && <ExerciseDetails exercise={selectedExercise} />}
      </div>}
    </section>
  )
}

function ExerciseCard({ exercise, isSelected, onSelect }) { return <button type="button" onClick={onSelect} className={`text-left rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-[#91aa76] ${isSelected ? 'border-[#719b35] bg-[#eff7dd]' : 'border-[#dfe6d9] bg-white'}`}><div className="flex items-start justify-between gap-3"><h2 className="font-display text-xl font-bold text-[#18221d]">{exercise.name}</h2><span className="rounded-full bg-[#e7f4c7] px-2.5 py-1 text-xs font-semibold text-[#527b20]">{exercise.difficulty}</span></div><p className="mt-5 text-sm text-[#718078]">{exercise.muscle_group} <span className="px-1 text-[#bac8b5]">/</span> {exercise.equipment}</p><p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9cad9a]">{exercise.category}</p></button> }
function ExerciseDetails({ exercise }) { return <aside className="h-fit rounded-2xl bg-[#18221d] p-6 text-white lg:sticky lg:top-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#91aa76]">Movement details</p><h2 className="font-display mt-3 text-3xl font-bold text-[#e7f4c7]">{exercise.name}</h2><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><Detail label="Muscle group" value={exercise.muscle_group} /><Detail label="Equipment" value={exercise.equipment} /><Detail label="Category" value={exercise.category} /><Detail label="Difficulty" value={exercise.difficulty} /></div><div className="mt-7 border-t border-white/10 pt-6"><p className="text-sm font-semibold text-[#d8e5ca]">How to perform</p><p className="mt-3 text-sm leading-6 text-[#b7c4b5]">{exercise.instructions}</p></div></aside> }
function Detail({ label, value }) { return <div><p className="text-xs text-[#91aa76]">{label}</p><p className="mt-1 font-semibold text-[#f7faf2]">{value}</p></div> }
