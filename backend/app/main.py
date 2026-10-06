from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, analytics, auth, exercises, goals, nutrition, profile, supplements, users, workouts
from app.core.config import get_settings
from app.database.session import Base, SessionLocal, engine
from app.models import User
from app.services.exercise import seed_exercises

settings = get_settings()
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_exercises(db)

app = FastAPI(title='FitTrack AI API', version='0.1.0')
allowed_origins = {settings.frontend_origin, 'http://localhost:5173', 'http://127.0.0.1:5173'}
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(auth.router, prefix='/api')
app.include_router(ai.router, prefix='/api')
app.include_router(analytics.router, prefix='/api')
app.include_router(exercises.router, prefix='/api')
app.include_router(profile.router, prefix='/api')
app.include_router(goals.router, prefix='/api')
app.include_router(nutrition.router, prefix='/api')
app.include_router(supplements.router, prefix='/api')
app.include_router(users.router, prefix='/api')
app.include_router(workouts.router, prefix='/api')


@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
