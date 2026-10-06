import json
import zlib
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings


class ApiNinjasExercise(BaseModel):
    name: str
    type: str
    muscle: str
    equipments: list[str]
    difficulty: str
    instructions: str
    safety_info: str | None = None


def search_external_exercises(
    search: str | None = None,
    muscle_group: str | None = None,
    equipment: str | None = None,
    difficulty: str | None = None,
) -> list[dict]:

    settings = get_settings()

    if not settings.exercise_api_key:
        return []

    query = {
        key: value.strip().lower()
        for key, value in {
            "name": search,
            "muscle": muscle_group,
            "equipments": equipment,
            "difficulty": difficulty,
        }.items()
        if value and value.strip()
    }

    url = settings.exercise_api_url

    if query:
        url = f"{url}?{urlencode(query)}"

    request = Request(
        url,
        headers={
            "X-Api-Key": settings.exercise_api_key,
            "Accept": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            payload = json.loads(
                response.read().decode("utf-8")
            )

    except HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Exercise provider returned HTTP {error.code}.",
        ) from error

    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Exercise provider is unavailable or timed out.",
        ) from error

    if not isinstance(payload, list):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Exercise provider returned an invalid response.",
        )

    try:
        exercises = [
            ApiNinjasExercise.model_validate(item)
            for item in payload
        ]

        return [
            map_external_exercise(exercise)
            for exercise in exercises
        ]

    except (ValidationError, TypeError) as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Exercise provider returned an invalid exercise format.",
        ) from error


def map_external_exercise(
    exercise: ApiNinjasExercise,
) -> dict:

    stable_key = (
        f"{exercise.name}|"
        f"{exercise.muscle}|"
        f"{','.join(exercise.equipments)}"
    )

    return {
        "id": zlib.crc32(
            stable_key.encode("utf-8")
        ) & 0x7FFFFFFF,

        "name": exercise.name,

        "muscle_group": exercise.muscle.title(),

        "equipment": ", ".join(
            equipment.title()
            for equipment in exercise.equipments
        ),

        "category": exercise.type.title(),

        "instructions": exercise.instructions,

        "difficulty": exercise.difficulty.title(),
    }