from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field


class WorkoutCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    date: date
    duration: int | None = Field(default=None, ge=0, le=1440)
    notes: str = Field(default='', max_length=5000)


class WorkoutExerciseCreate(BaseModel):
    exercise_id: int


class WorkoutSetCreate(BaseModel):
    weight: float = Field(ge=0, le=2000)
    repetitions: int = Field(ge=1, le=1000)
    rpe: float | None = Field(default=None, ge=1, le=10)
    rest_seconds: int | None = Field(default=None, ge=0, le=3600)


class WorkoutSetUpdate(BaseModel):
    weight: float = Field(ge=0, le=2000)
    repetitions: int = Field(ge=1, le=1000)
    rpe: float | None = Field(default=None, ge=1, le=10)
    rest_seconds: int | None = Field(default=None, ge=0, le=3600)


class WorkoutSetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    set_number: int
    weight: float
    repetitions: int
    rpe: float | None
    rest_seconds: int | None

    @computed_field
    @property
    def volume(self) -> float:
        return self.weight * self.repetitions


class WorkoutExerciseResponse(BaseModel):
    id: int
    exercise_id: int
    exercise_name: str
    muscle_group: str
    sets: list[WorkoutSetResponse]

    @computed_field
    @property
    def volume(self) -> float:
        return sum(workout_set.volume for workout_set in self.sets)


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    name: str
    date: date
    duration: int | None
    notes: str
    completed: bool
    completed_at: datetime | None
    exercises: list[WorkoutExerciseResponse]
    total_volume: float
    personal_records: list[str] = Field(default_factory=list)
