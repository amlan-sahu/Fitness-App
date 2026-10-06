from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics import build_analytics

router = APIRouter(prefix='/analytics', tags=['analytics'])


@router.get('/dashboard', response_model=AnalyticsResponse)
def dashboard_analytics(current_user: CurrentUser, db: DbSession) -> AnalyticsResponse:
    return build_analytics(db, current_user.id)
