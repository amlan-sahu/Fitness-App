from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.schemas.ai import WorkoutProgressSummary
from app.services.ai import analyze_assistant, analyze_workout_progress

router = APIRouter(prefix='/ai', tags=['ai'])


@router.post('/workout-summary', response_model=WorkoutProgressSummary)
def workout_summary(current_user: CurrentUser, db: DbSession) -> WorkoutProgressSummary:
    return analyze_workout_progress(db, current_user.id)


@router.post('/assistant', response_model=AssistantResponse)
def assistant(request: AssistantRequest, current_user: CurrentUser, db: DbSession) -> AssistantResponse:
    return analyze_assistant(db, current_user.id, request.feature)
