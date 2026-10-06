from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import CurrentUser, DbSession
from app.core.config import get_settings
from app.schemas.exercise import ExerciseResponse
from app.services.exercise import get_exercise, list_exercises
from app.services.exercise_api import search_external_exercises

router = APIRouter(prefix='/exercises', tags=['exercises'])


@router.get('/external', response_model=list[ExerciseResponse])
def read_external_exercises(
    current_user: CurrentUser,
    db: DbSession,
    search: str | None = Query(default=None, max_length=100),
    muscle_group: str | None = Query(default=None, max_length=80),
    equipment: str | None = Query(default=None, max_length=80),
    difficulty: str | None = Query(default=None, max_length=40),
) -> list[ExerciseResponse]:
    if not get_settings().exercise_api_key:
        return list_exercises(db, search, muscle_group, equipment)
    return search_external_exercises(search, muscle_group, equipment, difficulty)


@router.get('', response_model=list[ExerciseResponse])
def read_exercises(
    current_user: CurrentUser,
    db: DbSession,
    search: str | None = Query(default=None, max_length=100),
    muscle_group: str | None = Query(default=None, max_length=80),
    equipment: str | None = Query(default=None, max_length=80),
) -> list[ExerciseResponse]:
    return list_exercises(db, search, muscle_group, equipment)


@router.get('/{exercise_id}', response_model=ExerciseResponse)
def read_exercise(exercise_id: int, current_user: CurrentUser, db: DbSession) -> ExerciseResponse:
    exercise = get_exercise(db, exercise_id)
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Exercise not found')
    return exercise
