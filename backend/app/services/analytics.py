from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.goal import Goal
from app.models.profile import Profile
from app.models.weight_entry import WeightEntry
from app.models.workout import Workout, WorkoutExercise
from app.schemas.analytics import AnalyticsResponse


def build_analytics(db: Session, user_id: int) -> AnalyticsResponse:
    workouts = list(db.scalars(select(Workout).where(Workout.user_id == user_id, Workout.completed.is_(True)).options(selectinload(Workout.exercises).selectinload(WorkoutExercise.exercise), selectinload(Workout.exercises).selectinload(WorkoutExercise.sets)).order_by(Workout.date)).all())
    profile = db.scalar(select(Profile).where(Profile.user_id == user_id))
    goal = db.scalar(select(Goal).where(Goal.user_id == user_id))
    weight_entries = list(db.scalars(select(WeightEntry).where(WeightEntry.user_id == user_id).order_by(WeightEntry.date, WeightEntry.id)).all())

    volume_by_date = defaultdict(float)
    frequency_by_date = defaultdict(int)
    exercise_volume = defaultdict(float)
    strength_points = []
    personal_records = []
    previous_max_by_exercise = {}
    total_duration = 0

    for workout in workouts:
        frequency_by_date[workout.date] += 1
        workout_volume = 0.0
        if workout.duration:
            total_duration += workout.duration
        for workout_exercise in workout.exercises:
            exercise_max = None
            for workout_set in workout_exercise.sets:
                workout_volume += workout_set.volume
                exercise_volume[workout_exercise.exercise.name] += workout_set.volume
                exercise_max = max(exercise_max or workout_set.weight, workout_set.weight)
            if exercise_max is not None:
                strength_points.append({'date': workout.date, 'exercise_name': workout_exercise.exercise.name, 'weight': exercise_max})
                previous_max = previous_max_by_exercise.get(workout_exercise.exercise_id)
                if previous_max is None or exercise_max > previous_max:
                    personal_records.append({'date': workout.date, 'exercise_name': workout_exercise.exercise.name, 'weight': exercise_max})
                    previous_max_by_exercise[workout_exercise.exercise_id] = exercise_max
        volume_by_date[workout.date] += workout_volume

    today = date.today()
    weekly_start = today - timedelta(days=6)
    current_weight = profile.weight_kg if profile else None
    if not weight_entries and current_weight is not None:
        weight_entries = [{'date': profile.updated_at.date() if profile and profile.updated_at else today, 'weight_kg': current_weight}]
    goal_progress = calculate_goal_progress(goal, current_weight)
    summary = {
        'total_workouts': len(workouts),
        'weekly_workout_count': sum(count for workout_date, count in frequency_by_date.items() if workout_date >= weekly_start),
        'total_training_volume': sum(volume_by_date.values()),
        'total_workout_duration': total_duration,
        'average_workout_duration': round(total_duration / len(workouts), 1) if workouts else 0,
        'current_weight': current_weight,
        'target_weight': goal.target_weight_kg if goal else None,
        'primary_goal': goal.goal_type if goal else None,
        'goal_progress_percent': goal_progress,
    }
    recent_workouts = [{'id': workout.id, 'name': workout.name, 'date': workout.date, 'duration': workout.duration, 'total_volume': sum(workout_set.volume for item in workout.exercises for workout_set in item.sets), 'exercise_count': len(workout.exercises)} for workout in reversed(workouts[-5:])]
    return AnalyticsResponse(summary=summary, recent_workouts=recent_workouts, recent_personal_records=list(reversed(personal_records[-5:])), body_weight=[{'date': item.date, 'value': item.weight_kg} for item in weight_entries], workout_frequency=[{'date': key, 'value': value} for key, value in sorted(frequency_by_date.items())], training_volume=[{'date': key, 'value': round(value, 1)} for key, value in sorted(volume_by_date.items())], exercise_volume=[{'exercise_name': key, 'volume': round(value, 1)} for key, value in sorted(exercise_volume.items(), key=lambda pair: pair[1], reverse=True)], strength_progression=strength_points)


def calculate_goal_progress(goal: Goal | None, current_weight: float | None) -> float | None:
    if goal is None or current_weight is None or goal.current_weight_kg == goal.target_weight_kg:
        return None
    total_change = abs(goal.current_weight_kg - goal.target_weight_kg)
    completed_change = abs(goal.current_weight_kg - current_weight)
    return round(max(0, min(100, completed_change / total_change * 100)), 1)
