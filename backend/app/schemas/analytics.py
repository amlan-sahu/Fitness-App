from datetime import date

from pydantic import BaseModel


class WorkoutAnalyticsSummary(BaseModel):
    total_workouts: int
    weekly_workout_count: int
    total_training_volume: float
    total_workout_duration: int
    average_workout_duration: float
    current_weight: float | None
    target_weight: float | None
    primary_goal: str | None
    goal_progress_percent: float | None


class RecentWorkout(BaseModel):
    id: int
    name: str
    date: date
    duration: int | None
    total_volume: float
    exercise_count: int


class ChartPoint(BaseModel):
    date: date
    value: float


class ExerciseVolumePoint(BaseModel):
    exercise_name: str
    volume: float


class StrengthPoint(BaseModel):
    date: date
    exercise_name: str
    weight: float


class PersonalRecordPoint(BaseModel):
    date: date
    exercise_name: str
    weight: float


class AnalyticsResponse(BaseModel):
    summary: WorkoutAnalyticsSummary
    recent_workouts: list[RecentWorkout]
    recent_personal_records: list[PersonalRecordPoint]
    body_weight: list[ChartPoint]
    workout_frequency: list[ChartPoint]
    training_volume: list[ChartPoint]
    exercise_volume: list[ExerciseVolumePoint]
    strength_progression: list[StrengthPoint]
