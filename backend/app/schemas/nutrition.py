from datetime import date
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class MealType(StrEnum):
    BREAKFAST = 'breakfast'
    LUNCH = 'lunch'
    DINNER = 'dinner'
    SNACK = 'snack'


class NutritionEntryCreate(BaseModel):
    food_name: str = Field(min_length=1, max_length=160)
    meal_type: MealType
    serving_size: str = Field(min_length=1, max_length=120)
    calories: int = Field(ge=0, le=10000)
    protein: float = Field(ge=0, le=1000)
    carbohydrates: float = Field(ge=0, le=1000)
    fat: float = Field(ge=0, le=1000)
    fiber: float = Field(ge=0, le=1000)
    date: date


class NutritionEntryResponse(NutritionEntryCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class NutritionTargets(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    calories: int = Field(ge=1, le=20000)
    protein: float = Field(ge=1, le=2000)
    carbohydrates: float = Field(ge=1, le=2000)
    fat: float = Field(ge=1, le=2000)


class NutritionTotals(BaseModel):
    calories: int
    protein: float
    carbohydrates: float
    fat: float
    fiber: float


class DailyNutritionResponse(BaseModel):
    date: date
    entries: list[NutritionEntryResponse]
    totals: NutritionTotals
    targets: NutritionTargets


class WeeklyNutritionResponse(BaseModel):
    days: list[DailyNutritionResponse]
