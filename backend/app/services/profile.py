from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.weight_entry import WeightEntry
from app.schemas.profile import ProfileUpdate


def get_profile(db: Session, user_id: int) -> Profile | None:
    return db.scalar(select(Profile).where(Profile.user_id == user_id))


def upsert_profile(db: Session, user_id: int, profile_data: ProfileUpdate) -> Profile:
    profile = get_profile(db, user_id)
    if profile is None:
        profile = Profile(user_id=user_id)
        db.add(profile)
    for field, value in profile_data.model_dump().items():
        setattr(profile, field, value)
    if profile_data.weight_kg is not None:
        latest_weight = db.scalar(select(WeightEntry).where(WeightEntry.user_id == user_id).order_by(WeightEntry.date.desc(), WeightEntry.id.desc()).limit(1))
        if latest_weight is None or latest_weight.weight_kg != profile_data.weight_kg or latest_weight.date != date.today():
            db.add(WeightEntry(user_id=user_id, date=date.today(), weight_kg=profile_data.weight_kg))
    db.commit()
    db.refresh(profile)
    return profile
