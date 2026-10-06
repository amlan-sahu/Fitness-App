from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Exercise(Base):
    __tablename__ = 'exercises'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    muscle_group: Mapped[str] = mapped_column(String(80), index=True)
    equipment: Mapped[str] = mapped_column(String(80), index=True)
    category: Mapped[str] = mapped_column(String(80), index=True)
    instructions: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[str] = mapped_column(String(40), index=True)
