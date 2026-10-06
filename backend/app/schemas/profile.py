from pydantic import BaseModel, ConfigDict, Field


class ProfileUpdate(BaseModel):
    name: str = Field(default='', max_length=120)
    age: int | None = Field(default=None, ge=13, le=120)
    height_cm: float | None = Field(default=None, gt=0, le=300)
    weight_kg: float | None = Field(default=None, gt=0, le=500)
    gender: str | None = Field(default=None, max_length=40)
    fitness_level: str = Field(default='', max_length=40)
    training_experience: str = Field(default='', max_length=80)
    preferred_training_days: list[str] = Field(default_factory=list, max_length=7)


class ProfileResponse(ProfileUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
