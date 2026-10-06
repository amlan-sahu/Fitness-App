from datetime import date

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.nutrition import DailyNutritionResponse, NutritionEntryCreate, NutritionTargets, WeeklyNutritionResponse
from app.services.nutrition import create_entry, delete_entry, get_daily, get_targets, get_weekly, update_entry, update_targets

router = APIRouter(prefix='/nutrition', tags=['nutrition'])


@router.get('/daily', response_model=DailyNutritionResponse)
def daily(current_user: CurrentUser, db: DbSession, selected_date: date | None = None) -> DailyNutritionResponse:
    return get_daily(db, current_user.id, selected_date or date.today())


@router.get('/weekly', response_model=WeeklyNutritionResponse)
def weekly(current_user: CurrentUser, db: DbSession, end_date: date | None = None) -> WeeklyNutritionResponse:
    return get_weekly(db, current_user.id, end_date or date.today())


@router.get('/targets', response_model=NutritionTargets)
def read_targets(current_user: CurrentUser, db: DbSession) -> NutritionTargets:
    return get_targets(db, current_user.id)


@router.put('/targets', response_model=NutritionTargets)
def save_targets(data: NutritionTargets, current_user: CurrentUser, db: DbSession) -> NutritionTargets:
    return update_targets(db, current_user.id, data)


@router.post('/entries', response_model=DailyNutritionResponse, status_code=status.HTTP_201_CREATED)
def create(data: NutritionEntryCreate, current_user: CurrentUser, db: DbSession) -> DailyNutritionResponse:
    return create_entry(db, current_user.id, data)


@router.patch('/entries/{entry_id}', response_model=DailyNutritionResponse)
def update(entry_id: int, data: NutritionEntryCreate, current_user: CurrentUser, db: DbSession) -> DailyNutritionResponse:
    return update_entry(db, current_user.id, entry_id, data)


@router.delete('/entries/{entry_id}', response_model=DailyNutritionResponse)
def remove(entry_id: int, current_user: CurrentUser, db: DbSession) -> DailyNutritionResponse:
    return delete_entry(db, current_user.id, entry_id)
