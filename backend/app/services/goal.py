from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalUpdate


def get_primary_goal(db: Session, user_id: int) -> Goal | None:
    return db.scalar(select(Goal).where(Goal.user_id == user_id))


def upsert_primary_goal(db: Session, user_id: int, goal_data: GoalUpdate) -> Goal:
    goal = get_primary_goal(db, user_id)
    if goal is None:
        goal = Goal(user_id=user_id)
        db.add(goal)
    for field, value in goal_data.model_dump().items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal
