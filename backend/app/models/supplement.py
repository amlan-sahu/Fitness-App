from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Supplement(Base):
    __tablename__ = 'supplements'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    name: Mapped[str] = mapped_column(String(160))
    dosage: Mapped[str] = mapped_column(String(80))
    unit: Mapped[str] = mapped_column(String(40))
    frequency: Mapped[str] = mapped_column(String(120))
    notes: Mapped[str] = mapped_column(Text, default='')
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='supplements')
    logs = relationship('SupplementLog', back_populates='supplement', cascade='all, delete-orphan')


class SupplementLog(Base):
    __tablename__ = 'supplement_logs'
    __table_args__ = (UniqueConstraint('supplement_id', 'date', name='uq_supplement_log_date'),)

    id: Mapped[int] = mapped_column(primary_key=True)
    supplement_id: Mapped[int] = mapped_column(ForeignKey('supplements.id', ondelete='CASCADE'), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    taken: Mapped[bool] = mapped_column(Boolean, default=False)

    supplement = relationship('Supplement', back_populates='logs')
