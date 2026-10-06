from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.exercise import Exercise

SEED_EXERCISES = [
    {'name': 'Bench Press', 'muscle_group': 'Chest', 'equipment': 'Barbell', 'category': 'Push', 'difficulty': 'Intermediate', 'instructions': 'Lie on the bench, lower the bar to your mid-chest with control, then press it upward until your arms are extended.'},
    {'name': 'Squat', 'muscle_group': 'Legs', 'equipment': 'Barbell', 'category': 'Compound', 'difficulty': 'Intermediate', 'instructions': 'Brace your core, sit your hips down and back, then drive through your feet to stand tall.'},
    {'name': 'Deadlift', 'muscle_group': 'Back', 'equipment': 'Barbell', 'category': 'Pull', 'difficulty': 'Advanced', 'instructions': 'Hinge at the hips with a neutral spine, lift the bar close to your body, and stand by extending your hips.'},
    {'name': 'Barbell Row', 'muscle_group': 'Back', 'equipment': 'Barbell', 'category': 'Pull', 'difficulty': 'Intermediate', 'instructions': 'Hinge forward, keep your back neutral, pull the bar toward your lower ribs, then lower it slowly.'},
    {'name': 'Overhead Press', 'muscle_group': 'Shoulders', 'equipment': 'Barbell', 'category': 'Push', 'difficulty': 'Intermediate', 'instructions': 'Start with the bar at shoulder height, brace your trunk, and press overhead without leaning back.'},
    {'name': 'Pull Up', 'muscle_group': 'Back', 'equipment': 'Bodyweight', 'category': 'Pull', 'difficulty': 'Advanced', 'instructions': 'Hang from the bar, pull your chest toward it by driving your elbows down, then lower with control.'},
    {'name': 'Dumbbell Curl', 'muscle_group': 'Biceps', 'equipment': 'Dumbbells', 'category': 'Isolation', 'difficulty': 'Beginner', 'instructions': 'Keep your elbows close to your sides, curl the dumbbells toward your shoulders, and lower them slowly.'},
]


def seed_exercises(db: Session) -> None:
    if db.scalar(select(Exercise.id).limit(1)) is not None:
        return
    db.add_all([Exercise(**exercise) for exercise in SEED_EXERCISES])
    db.commit()


def list_exercises(db: Session, search: str | None, muscle_group: str | None, equipment: str | None) -> list[Exercise]:
    statement = select(Exercise).order_by(Exercise.name)
    if search:
        search_value = f'%{search.strip().lower()}%'
        statement = statement.where(func.lower(Exercise.name).like(search_value) | func.lower(Exercise.instructions).like(search_value))
    if muscle_group:
        statement = statement.where(func.lower(Exercise.muscle_group) == muscle_group.strip().lower())
    if equipment:
        statement = statement.where(func.lower(Exercise.equipment) == equipment.strip().lower())
    return list(db.scalars(statement).all())


def get_exercise(db: Session, exercise_id: int) -> Exercise | None:
    return db.get(Exercise, exercise_id)
