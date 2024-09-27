from typing_extensions import Annotated, List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, StringConstraints
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from enum import Enum

from databases import Database

DATABASE_URL = "postgresql://postgres:1324@localhost/peerprep"

database = Database(DATABASE_URL)
metadata = MetaData()


class Complexity(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class Question(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2)]
    description: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5)]
    category: str
    complexity: Complexity


questions = Table(
    "questions",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("title", String(100)),
    Column("description", String(500)),
    Column("category", String(50)),
    Column("complexity", String(50)),
)

engine = create_engine(DATABASE_URL)
metadata.create_all(engine)

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
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/questions/complexities")
async def get_complexities()-> list[str]:
    return [complexity.value for complexity in Complexity]


@app.post("/questions")
async def create_question(question: Question):
    query = questions.insert().values(
        title=question.title,
        description=question.description,
        category=question.category,
        complexity=question.complexity,
    )
    last_record_id = await database.execute(query)
    return {**question.dict(), "id": last_record_id}


@app.get("/questions")
async def get_questions():
    query = questions.select()
    return await database.fetch_all(query)


@app.put("/questions/{id}")
async def update_question(id: int, question: Question):
    query = (
        questions.update()
        .where(questions.c.id == id)
        .values(
            title=question.title,
            description=question.description,
            category=question.category,
            complexity=question.complexity,
        )
    )
    await database.execute(query)
    return {"msg": "Question updated"}


@app.delete("/questions/{id}")
async def delete_question(id: int):
    query = questions.delete().where(questions.c.id == id)
    await database.execute(query)
    return {"msg": "Question deleted"}
