from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class NutritionEntry(Base):
    __tablename__ = 'nutrition_entries'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    food_name: Mapped[str] = mapped_column(String(160))
    meal_type: Mapped[str] = mapped_column(String(30), index=True)
    serving_size: Mapped[str] = mapped_column(String(120))
    calories: Mapped[int] = mapped_column(Integer)
    protein: Mapped[float] = mapped_column(Float)
    carbohydrates: Mapped[float] = mapped_column(Float)
    fat: Mapped[float] = mapped_column(Float)
    fiber: Mapped[float] = mapped_column(Float)
    date: Mapped[date] = mapped_column(Date, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='nutrition_entries')


class NutritionTarget(Base):
    __tablename__ = 'nutrition_targets'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), unique=True, index=True)
    calories: Mapped[int] = mapped_column(Integer, default=2200)
    protein: Mapped[float] = mapped_column(Float, default=170)
    carbohydrates: Mapped[float] = mapped_column(Float, default=250)
    fat: Mapped[float] = mapped_column(Float, default=70)

    user = relationship('User', back_populates='nutrition_target')
