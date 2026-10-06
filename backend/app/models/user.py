from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile = relationship('Profile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    primary_goal = relationship('Goal', back_populates='user', uselist=False, cascade='all, delete-orphan')
    weight_entries = relationship('WeightEntry', back_populates='user', cascade='all, delete-orphan')
    nutrition_entries = relationship('NutritionEntry', back_populates='user', cascade='all, delete-orphan')
    nutrition_target = relationship('NutritionTarget', back_populates='user', uselist=False, cascade='all, delete-orphan')
    supplements = relationship('Supplement', back_populates='user', cascade='all, delete-orphan')
