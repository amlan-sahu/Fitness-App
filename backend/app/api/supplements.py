from datetime import date

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.supplement import SupplementCreate, SupplementDashboardResponse, SupplementLogUpdate, SupplementResponse
from app.services.supplement import build_dashboard, create_supplement, delete_supplement, set_log, update_supplement

router = APIRouter(prefix='/supplements', tags=['supplements'])


@router.get('/dashboard', response_model=SupplementDashboardResponse)
def dashboard(current_user: CurrentUser, db: DbSession, selected_date: date | None = None) -> SupplementDashboardResponse:
    return build_dashboard(db, current_user.id, selected_date or date.today())


@router.post('', response_model=SupplementResponse, status_code=status.HTTP_201_CREATED)
def create(data: SupplementCreate, current_user: CurrentUser, db: DbSession) -> SupplementResponse:
    return create_supplement(db, current_user.id, data)


@router.patch('/{supplement_id}', response_model=SupplementResponse)
def update(supplement_id: int, data: SupplementCreate, current_user: CurrentUser, db: DbSession) -> SupplementResponse:
    return update_supplement(db, current_user.id, supplement_id, data)


@router.delete('/{supplement_id}', status_code=status.HTTP_204_NO_CONTENT)
def remove(supplement_id: int, current_user: CurrentUser, db: DbSession) -> None:
    delete_supplement(db, current_user.id, supplement_id)


@router.put('/{supplement_id}/logs/{selected_date}', response_model=SupplementDashboardResponse)
def log_taken(supplement_id: int, selected_date: date, data: SupplementLogUpdate, current_user: CurrentUser, db: DbSession) -> SupplementDashboardResponse:
    return set_log(db, current_user.id, supplement_id, selected_date, data.taken)
