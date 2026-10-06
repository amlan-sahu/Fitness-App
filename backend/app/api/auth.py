from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.api.deps import DbSession
from app.core.security import create_access_token
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth import authenticate_user, create_user, get_user_by_email

router = APIRouter(prefix='/auth', tags=['authentication'])


@router.post('/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: DbSession) -> UserResponse:
    if get_user_by_email(db, user_data.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='An account with this email already exists')
    try:
        return create_user(db, user_data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='An account with this email already exists') from None


@router.post('/login', response_model=TokenResponse)
def login(credentials: UserLogin, db: DbSession) -> TokenResponse:
    user = authenticate_user(db, credentials.email, credentials.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    return TokenResponse(access_token=create_access_token(user.email), user=user)
