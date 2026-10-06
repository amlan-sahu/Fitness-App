from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.goal import GoalResponse, GoalUpdate
from app.services.goal import get_primary_goal, upsert_primary_goal

router = APIRouter(prefix='/goals', tags=['goals'])


@router.get('/primary', response_model=GoalResponse | None)
def read_primary_goal(current_user: CurrentUser, db: DbSession) -> GoalResponse | None:
    return get_primary_goal(db, current_user.id)


@router.put('/primary', response_model=GoalResponse, status_code=status.HTTP_200_OK)
def update_primary_goal(goal_data: GoalUpdate, current_user: CurrentUser, db: DbSession) -> GoalResponse:
    return upsert_primary_goal(db, current_user.id, goal_data)
