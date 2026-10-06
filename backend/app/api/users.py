from fastapi import APIRouter

from app.api.deps import CurrentUser
from app.schemas.auth import UserResponse

router = APIRouter(prefix='/users', tags=['users'])


@router.get('/me', response_model=UserResponse)
def read_current_user(current_user: CurrentUser) -> UserResponse:
    return current_user


@router.get('/protected')
def protected_test(current_user: CurrentUser) -> dict[str, str]:
    return {'message': f'Authenticated as {current_user.email}'}
