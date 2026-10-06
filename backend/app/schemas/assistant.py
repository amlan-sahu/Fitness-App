from typing import Literal

from pydantic import BaseModel, Field


AssistantFeature = Literal['workout_suggestions', 'meal_suggestions', 'progress_explanation', 'weekly_summary']


class AssistantRequest(BaseModel):
    feature: AssistantFeature


class AssistantItem(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    detail: str = Field(min_length=1, max_length=1000)


class AssistantResponse(BaseModel):
    feature: AssistantFeature
    summary: str = Field(min_length=1, max_length=2000)
    items: list[AssistantItem] = Field(default_factory=list, max_length=8)
    next_steps: list[str] = Field(default_factory=list, max_length=8)
    disclaimer: str = Field(min_length=1, max_length=500)


class AssistantLLMResponse(BaseModel):
    summary: str = Field(min_length=1, max_length=2000)
    items: list[AssistantItem] = Field(default_factory=list, max_length=8)
    next_steps: list[str] = Field(default_factory=list, max_length=8)
    disclaimer: str = Field(min_length=1, max_length=500)
