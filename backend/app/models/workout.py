from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Workout(Base):
    __tablename__ = 'workouts'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    name: Mapped[str] = mapped_column(String(160))
    date: Mapped[date] = mapped_column(Date)
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default='')
    completed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    exercises = relationship('WorkoutExercise', back_populates='workout', cascade='all, delete-orphan', order_by='WorkoutExercise.order_index')


class WorkoutExercise(Base):
    __tablename__ = 'workout_exercises'

    id: Mapped[int] = mapped_column(primary_key=True)
    workout_id: Mapped[int] = mapped_column(ForeignKey('workouts.id', ondelete='CASCADE'), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey('exercises.id'), index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    workout = relationship('Workout', back_populates='exercises')
    exercise = relationship('Exercise')
    sets = relationship('WorkoutSet', back_populates='workout_exercise', cascade='all, delete-orphan', order_by='WorkoutSet.set_number')


class WorkoutSet(Base):
    __tablename__ = 'workout_sets'

    id: Mapped[int] = mapped_column(primary_key=True)
    workout_exercise_id: Mapped[int] = mapped_column(ForeignKey('workout_exercises.id', ondelete='CASCADE'), index=True)
    set_number: Mapped[int] = mapped_column(Integer)
    weight: Mapped[float] = mapped_column(Float)
    repetitions: Mapped[int] = mapped_column(Integer)
    rpe: Mapped[float | None] = mapped_column(Float, nullable=True)
    rest_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    workout_exercise = relationship('WorkoutExercise', back_populates='sets')

    @property
    def volume(self) -> float:
        return self.weight * self.repetitions
