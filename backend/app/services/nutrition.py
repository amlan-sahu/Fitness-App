from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.nutrition import NutritionEntry, NutritionTarget
from app.schemas.nutrition import DailyNutritionResponse, NutritionEntryCreate, NutritionTargets, NutritionTotals, WeeklyNutritionResponse

DEFAULT_TARGETS = {'calories': 2200, 'protein': 170, 'carbohydrates': 250, 'fat': 70}


def get_targets(db: Session, user_id: int) -> NutritionTarget:
    targets = db.scalar(select(NutritionTarget).where(NutritionTarget.user_id == user_id))
    if targets is None:
        targets = NutritionTarget(user_id=user_id, **DEFAULT_TARGETS)
        db.add(targets)
        db.commit()
        db.refresh(targets)
    return targets


def update_targets(db: Session, user_id: int, data: NutritionTargets) -> NutritionTarget:
    targets = get_targets(db, user_id)
    for field, value in data.model_dump().items():
        setattr(targets, field, value)
    db.commit()
    db.refresh(targets)
    return targets


def get_entry(db: Session, user_id: int, entry_id: int) -> NutritionEntry:
    entry = db.scalar(select(NutritionEntry).where(NutritionEntry.id == entry_id, NutritionEntry.user_id == user_id))
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Nutrition entry not found')
    return entry


def get_daily(db: Session, user_id: int, selected_date: date) -> DailyNutritionResponse:
    entries = list(db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == user_id, NutritionEntry.date == selected_date).order_by(NutritionEntry.created_at, NutritionEntry.id)).all())
    totals = NutritionTotals(calories=sum(item.calories for item in entries), protein=round(sum(item.protein for item in entries), 1), carbohydrates=round(sum(item.carbohydrates for item in entries), 1), fat=round(sum(item.fat for item in entries), 1), fiber=round(sum(item.fiber for item in entries), 1))
    target = get_targets(db, user_id)
    return DailyNutritionResponse(date=selected_date, entries=entries, totals=totals, targets=target)


def get_weekly(db: Session, user_id: int, end_date: date) -> WeeklyNutritionResponse:
    start_date = end_date - timedelta(days=6)
    return WeeklyNutritionResponse(days=[get_daily(db, user_id, start_date + timedelta(days=offset)) for offset in range(7)])


def create_entry(db: Session, user_id: int, data: NutritionEntryCreate) -> DailyNutritionResponse:
    db.add(NutritionEntry(user_id=user_id, **data.model_dump()))
    db.commit()
    return get_daily(db, user_id, data.date)


def update_entry(db: Session, user_id: int, entry_id: int, data: NutritionEntryCreate) -> DailyNutritionResponse:
    entry = get_entry(db, user_id, entry_id)
    for field, value in data.model_dump().items():
        setattr(entry, field, value)
    db.commit()
    return get_daily(db, user_id, data.date)


def delete_entry(db: Session, user_id: int, entry_id: int) -> DailyNutritionResponse:
    entry = get_entry(db, user_id, entry_id)
    selected_date = entry.date
    db.delete(entry)
    db.commit()
    return get_daily(db, user_id, selected_date)
