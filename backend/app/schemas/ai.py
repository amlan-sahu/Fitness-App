from pydantic import BaseModel, Field


class WorkoutProgressSummary(BaseModel):
    summary: str = Field(min_length=1, max_length=2000)
    strengths: list[str] = Field(default_factory=list, max_length=8)
    areas_to_improve: list[str] = Field(default_factory=list, max_length=8)
    suggestions: list[str] = Field(default_factory=list, max_length=8)
