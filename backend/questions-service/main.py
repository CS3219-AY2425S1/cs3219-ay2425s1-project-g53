import typing
from enum import Enum

import json5
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, StringConstraints, ValidationError
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    create_engine,
    event,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from typing_extensions import Annotated

DATABASE_URL = "postgresql://admin@localhost/postgres"

Base = declarative_base()

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


engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()


class Complexity(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class QuestionBase(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2)]
    description: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5)]
    categories: typing.List[
        Annotated[str, StringConstraints(strip_whitespace=True, min_length=2)]
    ]
    complexity: Complexity

    def toQuestion(self) -> Question:
        return Question(
            title=self.title,
            description=self.description,
            complexity=self.complexity.value,
            categories=[add_or_create_category(n) for n in self.categories],
        )


class QuestionFull(QuestionBase):
    id: int

    class Config:
        from_attributes = True


def add_or_create_category(name: str) -> Category:
    category = session.query(Category).filter_by(name=name).first()
    if category is None:
        category = Category(name=name)
        session.add(category)
        session.commit()
    return category


@event.listens_for(Base.metadata, "after_create")
def init(**kwargs):
    with open("leetcode.json", mode="r") as f:
        data = json5.load(f)
        for entry in data:
            try:
                question: Question = QuestionBase(
                    title=entry["title"],
                    description=entry["question"] + "\n" + "\n".join(entry["examples"]),
                    categories=entry["category"],
                    complexity=entry["complexity"],
                ).toQuestion()
                title = session.query(Question.title).filter_by(title=question.title).first()
                if title is None:
                    session.add(question)
                    session.commit()
                else:
                    continue
            except ValidationError as e:
                print(e)
            except KeyError as e:
                print(e)
                print(entry)


init()

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    pass


@app.on_event("shutdown")
async def shutdown():
    # await database.disconnect()
    pass


@app.get("/questions/categories")
def get_categories() -> list[str]:
    return session.query(Category.name).all()


@app.get("/questions/complexities")
def get_complexities() -> list[str]:
    return [complexity.value for complexity in Complexity]


@app.post("/questions")
def create_question(question: QuestionBase) -> QuestionFull:
    db_question = question.toQuestion()
    session.add(db_question)
    session.commit()
    session.refresh(db_question)
    return db_question


@app.get("/questions")
def get_questions() -> list[QuestionFull]:
    return [
        {**q.__dict__, "categories": [c.name for c in q.categories]}
        for q in session.query(Question).all()
    ]

