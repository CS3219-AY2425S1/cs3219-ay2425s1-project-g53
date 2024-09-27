
from sqlalchemy import Column, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship

from .database import Base

question_categories = Table(
    "question_categories",
    Base.metadata,
    Column("question_id", Integer, ForeignKey("questions.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True),
)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    questions = relationship(
        "Question", secondary=question_categories, back_populates="categories"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    complexity = Column(String(16), nullable=False)

    categories = relationship(
        "Category", secondary=question_categories, back_populates="questions"
    )
