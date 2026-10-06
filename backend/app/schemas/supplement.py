from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class SupplementCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    dosage: str = Field(min_length=1, max_length=80)
    unit: str = Field(min_length=1, max_length=40)
    frequency: str = Field(min_length=1, max_length=120)
    notes: str = Field(default='', max_length=1000)


class SupplementResponse(SupplementCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool


class SupplementLogUpdate(BaseModel):
    taken: bool


class SupplementTodayItem(SupplementResponse):
    date: date
    taken: bool


class SupplementHistoryDay(BaseModel):
    date: date
    completed: int
    total: int
    adherence_percent: float


class SupplementDashboardResponse(BaseModel):
    date: date
    supplements: list[SupplementTodayItem]
    completed_count: int
    total_count: int
    adherence_percent: float
    history: list[SupplementHistoryDay]
