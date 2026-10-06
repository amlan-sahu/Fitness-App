from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.supplement import Supplement, SupplementLog
from app.schemas.supplement import SupplementCreate, SupplementDashboardResponse, SupplementHistoryDay, SupplementTodayItem


def list_supplements(db: Session, user_id: int) -> list[Supplement]:
    return list(db.scalars(select(Supplement).where(Supplement.user_id == user_id, Supplement.is_active.is_(True)).order_by(Supplement.name)).all())


def get_supplement(db: Session, user_id: int, supplement_id: int) -> Supplement:
    supplement = db.scalar(select(Supplement).where(Supplement.id == supplement_id, Supplement.user_id == user_id))
    if supplement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Supplement not found')
    return supplement


def create_supplement(db: Session, user_id: int, data: SupplementCreate) -> Supplement:
    supplement = Supplement(user_id=user_id, **data.model_dump())
    db.add(supplement)
    db.commit()
    db.refresh(supplement)
    return supplement


def update_supplement(db: Session, user_id: int, supplement_id: int, data: SupplementCreate) -> Supplement:
    supplement = get_supplement(db, user_id, supplement_id)
    for field, value in data.model_dump().items():
        setattr(supplement, field, value)
    db.commit()
    db.refresh(supplement)
    return supplement


def delete_supplement(db: Session, user_id: int, supplement_id: int) -> None:
    supplement = get_supplement(db, user_id, supplement_id)
    db.delete(supplement)
    db.commit()


def set_log(db: Session, user_id: int, supplement_id: int, selected_date: date, taken: bool) -> SupplementDashboardResponse:
    get_supplement(db, user_id, supplement_id)
    log = db.scalar(select(SupplementLog).where(SupplementLog.supplement_id == supplement_id, SupplementLog.date == selected_date))
    if log is None:
        db.add(SupplementLog(supplement_id=supplement_id, date=selected_date, taken=taken))
    else:
        log.taken = taken
    db.commit()
    return build_dashboard(db, user_id, selected_date)


def build_dashboard(db: Session, user_id: int, selected_date: date) -> SupplementDashboardResponse:
    supplements = list_supplements(db, user_id)
    logs = list(db.scalars(select(SupplementLog).join(Supplement).where(Supplement.user_id == user_id, SupplementLog.date == selected_date)).all())
    logs_by_supplement = {log.supplement_id: log.taken for log in logs}
    items = [SupplementTodayItem.model_validate({**supplement.__dict__, 'date': selected_date, 'taken': logs_by_supplement.get(supplement.id, False)}) for supplement in supplements]
    total = len(items)
    completed = sum(1 for item in items if item.taken)
    history = []
    for offset in range(6, -1, -1):
        history_date = selected_date - timedelta(days=offset)
        day_logs = list(db.scalars(select(SupplementLog).join(Supplement).where(Supplement.user_id == user_id, SupplementLog.date == history_date)).all())
        day_completed = sum(1 for log in day_logs if log.taken)
        history.append(SupplementHistoryDay(date=history_date, completed=day_completed, total=total, adherence_percent=round(day_completed / total * 100, 1) if total else 0))
    return SupplementDashboardResponse(date=selected_date, supplements=items, completed_count=completed, total_count=total, adherence_percent=round(completed / total * 100, 1) if total else 0, history=history)
