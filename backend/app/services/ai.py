import json
from datetime import date, timedelta
from typing import TypeVar
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.goal import Goal
from app.models.nutrition import NutritionEntry, NutritionTarget
from app.models.profile import Profile
from app.schemas.ai import WorkoutProgressSummary
from app.schemas.assistant import AssistantFeature, AssistantLLMResponse, AssistantResponse
from app.services.analytics import build_analytics

ValidatedResponse = TypeVar('ValidatedResponse', bound=BaseModel)

SYSTEM_PROMPT = '''You are FitTrack AI, a general fitness assistance layer. Use only the structured application context supplied by the user message. Return valid JSON only. Do not invent metrics, foods, exercises, or user details that are not supported by context. Do not diagnose medical conditions, prescribe treatment, or make medical claims. Do not claim to replace a doctor, dietitian, or qualified trainer. For health, injury, medication, or clinical questions, recommend speaking with an appropriately qualified healthcare professional. AI output is a draft for user review and must not be presented as an automatically applied plan.'''

FEATURE_INSTRUCTIONS = {
    'workout_suggestions': 'Suggest general workout ideas based on recent training, goal, exercise progression, and training preferences. Keep them as reviewable ideas, not database actions.',
    'meal_suggestions': 'Suggest general meal ideas that fit the provided calorie and macronutrient targets and recent nutrition summary. Do not make medical, allergy, or treatment claims.',
    'progress_explanation': 'Explain observable progress patterns from the supplied workout, strength, weight, and nutrition aggregates. Separate observations from uncertainty.',
    'weekly_summary': 'Summarize the user\'s recent week across training and nutrition data. Mention consistency, volume, duration, and relevant progress signals only when present.',
}


def build_workout_context(db: Session, user_id: int) -> dict:
    analytics = build_analytics(db, user_id)
    return {
        'goal': analytics.summary.primary_goal,
        'weekly_workout_count': analytics.summary.weekly_workout_count,
        'total_completed_workouts': analytics.summary.total_workouts,
        'total_training_volume_kg': analytics.summary.total_training_volume,
        'average_workout_duration_minutes': analytics.summary.average_workout_duration,
        'recent_workouts': [workout.model_dump(mode='json') for workout in analytics.recent_workouts],
        'recent_personal_records': [record.model_dump(mode='json') for record in analytics.recent_personal_records],
        'strength_progression': [point.model_dump(mode='json') for point in analytics.strength_progression[-12:]],
        'generated_for_date': date.today().isoformat(),
    }


def build_assistant_context(db: Session, user_id: int) -> dict:
    analytics = build_analytics(db, user_id)
    profile = db.scalar(select(Profile).where(Profile.user_id == user_id))
    goal = db.scalar(select(Goal).where(Goal.user_id == user_id))
    targets = db.scalar(select(NutritionTarget).where(NutritionTarget.user_id == user_id))
    start_date = date.today() - timedelta(days=6)
    entries = list(db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == user_id, NutritionEntry.date >= start_date)).all())
    nutrition = {
        'target_calories': targets.calories if targets else None,
        'target_protein_g': targets.protein if targets else None,
        'target_carbohydrates_g': targets.carbohydrates if targets else None,
        'target_fat_g': targets.fat if targets else None,
        'last_7_days_logged_calories': sum(entry.calories for entry in entries),
        'last_7_days_logged_protein_g': round(sum(entry.protein for entry in entries), 1),
        'last_7_days_logged_carbohydrates_g': round(sum(entry.carbohydrates for entry in entries), 1),
        'last_7_days_logged_fat_g': round(sum(entry.fat for entry in entries), 1),
        'logged_days': sorted({entry.date.isoformat() for entry in entries}),
    }
    return {
        'profile': {'fitness_level': profile.fitness_level, 'training_experience': profile.training_experience, 'preferred_training_days': profile.preferred_training_days} if profile else None,
        'goal': {'type': goal.goal_type, 'current_weight_kg': goal.current_weight_kg, 'target_weight_kg': goal.target_weight_kg, 'target_date': goal.target_date.isoformat()} if goal else None,
        'training': build_workout_context(db, user_id),
        'weight_trend': [{'date': point.model_dump(mode='json')['date'], 'weight_kg': point.value} for point in analytics.body_weight[-8:]],
        'nutrition': nutrition,
    }


def call_llm(system_prompt: str, context: dict, response_model: type[ValidatedResponse]) -> ValidatedResponse:
    settings = get_settings()
    if not settings.llm_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='AI assistance is not configured. Add LLM_API_KEY to the backend environment.')
    payload = {
        'model': settings.llm_model,
        'temperature': 0.2,
        'response_format': {'type': 'json_object'},
        'messages': [{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': f'Structured application context:\n{json.dumps(context, separators=(",", ":"))}'}],
    }
    request = Request(settings.llm_api_url, data=json.dumps(payload).encode('utf-8'), headers={'Authorization': f'Bearer {settings.llm_api_key}', 'Content-Type': 'application/json'}, method='POST')
    try:
        with urlopen(request, timeout=30) as response:
            provider_response = json.loads(response.read().decode('utf-8'))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='The AI provider could not complete the request.') from error
    try:
        content = provider_response['choices'][0]['message']['content']
        if not isinstance(content, str):
            raise ValueError('AI response content was not a string')
        return response_model.model_validate(json.loads(strip_json_fence(content)))
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='The AI provider returned an invalid structured response.') from error


def analyze_workout_progress(db: Session, user_id: int) -> WorkoutProgressSummary:
    return call_llm('''You are a general fitness progress assistant. Return JSON with exactly: summary (string), strengths (array of strings), areas_to_improve (array of strings), suggestions (array of strings). Keep suggestions general and grounded in the supplied workout data.''' + SYSTEM_PROMPT, build_workout_context(db, user_id), WorkoutProgressSummary)


def analyze_assistant(db: Session, user_id: int, feature: AssistantFeature) -> AssistantResponse:
    prompt = f'''{FEATURE_INSTRUCTIONS[feature]} Return JSON with exactly: summary (string), items (array of objects with title and detail), next_steps (array of strings), disclaimer (string). The response is a draft for user review; do not save or execute anything.'''
    result = call_llm(prompt + SYSTEM_PROMPT, build_assistant_context(db, user_id), AssistantLLMResponse)
    return AssistantResponse(feature=feature, **result.model_dump())


def strip_json_fence(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith('```'):
        cleaned = cleaned.removeprefix('```json').removeprefix('```').removesuffix('```').strip()
    return cleaned
