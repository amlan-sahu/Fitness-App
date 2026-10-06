from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.exercise import Exercise
from app.models.workout import Workout, WorkoutExercise, WorkoutSet
from app.schemas.workout import WorkoutCreate, WorkoutExerciseCreate, WorkoutSetCreate, WorkoutSetUpdate


def get_workout(db: Session, user_id: int, workout_id: int) -> Workout:
    workout = db.scalar(select(Workout).where(Workout.id == workout_id, Workout.user_id == user_id).options(selectinload(Workout.exercises).selectinload(WorkoutExercise.exercise), selectinload(Workout.exercises).selectinload(WorkoutExercise.sets)))
    if workout is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Workout not found')
    return workout


def list_workouts(db: Session, user_id: int) -> list[Workout]:
    return list(db.scalars(select(Workout).where(Workout.user_id == user_id).order_by(Workout.date.desc(), Workout.id.desc())).all())


def create_workout(db: Session, user_id: int, data: WorkoutCreate) -> Workout:
    workout = Workout(user_id=user_id, **data.model_dump())
    db.add(workout)
    db.commit()
    return get_workout(db, user_id, workout.id)


def add_exercise(db: Session, user_id: int, workout_id: int, data: WorkoutExerciseCreate) -> Workout:
    workout = get_workout(db, user_id, workout_id)
    if workout.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Completed workouts cannot be changed')
    exercise = db.get(Exercise, data.exercise_id)
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Exercise not found')
    if any(item.exercise_id == exercise.id for item in workout.exercises):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Exercise is already in this workout')
    workout.exercises.append(WorkoutExercise(exercise_id=exercise.id, order_index=len(workout.exercises)))
    db.commit()
    return get_workout(db, user_id, workout_id)


def get_workout_exercise(workout: Workout, workout_exercise_id: int) -> WorkoutExercise:
    workout_exercise = next((item for item in workout.exercises if item.id == workout_exercise_id), None)
    if workout_exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Workout exercise not found')
    return workout_exercise


def add_set(db: Session, user_id: int, workout_id: int, workout_exercise_id: int, data: WorkoutSetCreate) -> Workout:
    workout = get_workout(db, user_id, workout_id)
    if workout.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Completed workouts cannot be changed')
    workout_exercise = get_workout_exercise(workout, workout_exercise_id)
    workout_exercise.sets.append(WorkoutSet(set_number=len(workout_exercise.sets) + 1, **data.model_dump()))
    db.commit()
    return get_workout(db, user_id, workout_id)


def update_set(db: Session, user_id: int, workout_id: int, workout_exercise_id: int, set_id: int, data: WorkoutSetUpdate) -> Workout:
    workout = get_workout(db, user_id, workout_id)
    if workout.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Completed workouts cannot be changed')
    workout_exercise = get_workout_exercise(workout, workout_exercise_id)
    workout_set = next((item for item in workout_exercise.sets if item.id == set_id), None)
    if workout_set is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Set not found')
    for field, value in data.model_dump().items():
        setattr(workout_set, field, value)
    db.commit()
    return get_workout(db, user_id, workout_id)


def delete_set(db: Session, user_id: int, workout_id: int, workout_exercise_id: int, set_id: int) -> Workout:
    workout = get_workout(db, user_id, workout_id)
    if workout.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Completed workouts cannot be changed')
    workout_exercise = get_workout_exercise(workout, workout_exercise_id)
    workout_set = next((item for item in workout_exercise.sets if item.id == set_id), None)
    if workout_set is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Set not found')
    db.delete(workout_set)
    db.flush()
    for index, remaining_set in enumerate(workout_exercise.sets, start=1):
        remaining_set.set_number = index
    db.commit()
    return get_workout(db, user_id, workout_id)


def complete_workout(db: Session, user_id: int, workout_id: int) -> Workout:
    workout = get_workout(db, user_id, workout_id)
    if workout.completed:
        return workout
    if not workout.exercises or not any(item.sets for item in workout.exercises):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Add at least one exercise set before completing a workout')
    workout.completed = True
    workout.completed_at = datetime.now(timezone.utc)
    db.commit()
    return get_workout(db, user_id, workout_id)


def serialize_workout(workout: Workout, personal_records: list[str] | None = None) -> dict:
    exercises = [{'id': item.id, 'exercise_id': item.exercise_id, 'exercise_name': item.exercise.name, 'muscle_group': item.exercise.muscle_group, 'sets': item.sets} for item in workout.exercises]
    total_volume = sum(workout_set.volume for item in workout.exercises for workout_set in item.sets)
    return {**{field: getattr(workout, field) for field in ('id', 'user_id', 'name', 'date', 'duration', 'notes', 'completed', 'completed_at')}, 'exercises': exercises, 'total_volume': total_volume, 'personal_records': personal_records or []}


def detect_personal_records(db: Session, workout: Workout) -> list[str]:
    records = []
    for workout_exercise in workout.exercises:
        previous_max = db.scalar(select(WorkoutSet.weight).join(WorkoutExercise).join(Workout).where(Workout.user_id == workout.user_id, Workout.completed.is_(True), Workout.id != workout.id, WorkoutExercise.exercise_id == workout_exercise.exercise_id).order_by(WorkoutSet.weight.desc()).limit(1))
        current_max = max((workout_set.weight for workout_set in workout_exercise.sets), default=None)
        if current_max is not None and (previous_max is None or current_max > previous_max):
            records.append(workout_exercise.exercise.name)
    return records
