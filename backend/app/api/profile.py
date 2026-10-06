from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile import get_profile, upsert_profile

router = APIRouter(prefix='/profile', tags=['profile'])


@router.get('', response_model=ProfileResponse | None)
def read_profile(current_user: CurrentUser, db: DbSession) -> ProfileResponse | None:
    return get_profile(db, current_user.id)


@router.put('', response_model=ProfileResponse, status_code=status.HTTP_200_OK)
def update_profile(profile_data: ProfileUpdate, current_user: CurrentUser, db: DbSession) -> ProfileResponse:
    return upsert_profile(db, current_user.id, profile_data)
