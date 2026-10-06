from datetime import date
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class GoalType(StrEnum):
    FAT_LOSS = 'fat_loss'
    MUSCLE_GAIN = 'muscle_gain'
    STRENGTH = 'strength'
    MAINTENANCE = 'maintenance'
    GENERAL_FITNESS = 'general_fitness'


class GoalUpdate(BaseModel):
    goal_type: GoalType
    current_weight_kg: float = Field(gt=0, le=500)
    target_weight_kg: float = Field(gt=0, le=500)
    target_date: date
    description: str = Field(default='', max_length=1000)

    @field_validator('target_date')
    @classmethod
    def target_date_must_be_future(cls, value: date) -> date:
        if value <= date.today():
            raise ValueError('Target date must be in the future')
        return value


class GoalResponse(GoalUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
