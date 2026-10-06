from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.workout import WorkoutCreate, WorkoutExerciseCreate, WorkoutResponse, WorkoutSetCreate, WorkoutSetUpdate
from app.services.workout import add_exercise, add_set, complete_workout, create_workout, delete_set, detect_personal_records, get_workout, list_workouts, serialize_workout, update_set

router = APIRouter(prefix='/workouts', tags=['workouts'])


@router.post('', response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create(data: WorkoutCreate, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    return serialize_workout(create_workout(db, current_user.id, data))


@router.get('', response_model=list[WorkoutResponse])
def history(current_user: CurrentUser, db: DbSession) -> list[WorkoutResponse]:
    return [serialize_workout(workout) for workout in list_workouts(db, current_user.id)]


@router.get('/{workout_id}', response_model=WorkoutResponse)
def detail(workout_id: int, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    return serialize_workout(get_workout(db, current_user.id, workout_id))


@router.post('/{workout_id}/exercises', response_model=WorkoutResponse)
def add_workout_exercise(workout_id: int, data: WorkoutExerciseCreate, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    return serialize_workout(add_exercise(db, current_user.id, workout_id, data))


@router.post('/{workout_id}/exercises/{workout_exercise_id}/sets', response_model=WorkoutResponse)
def create_set(workout_id: int, workout_exercise_id: int, data: WorkoutSetCreate, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    return serialize_workout(add_set(db, current_user.id, workout_id, workout_exercise_id, data))


@router.patch('/{workout_id}/exercises/{workout_exercise_id}/sets/{set_id}', response_model=WorkoutResponse)
def edit_set(workout_id: int, workout_exercise_id: int, set_id: int, data: WorkoutSetUpdate, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    return serialize_workout(update_set(db, current_user.id, workout_id, workout_exercise_id, set_id, data))


@router.delete('/{workout_id}/exercises/{workout_exercise_id}/sets/{set_id}', response_model=WorkoutResponse)
def remove_set(workout_id: int, workout_exercise_id: int, set_id: int, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    return serialize_workout(delete_set(db, current_user.id, workout_id, workout_exercise_id, set_id))


@router.post('/{workout_id}/complete', response_model=WorkoutResponse)
def finish(workout_id: int, current_user: CurrentUser, db: DbSession) -> WorkoutResponse:
    workout = complete_workout(db, current_user.id, workout_id)
    return serialize_workout(workout, detect_personal_records(db, workout))
