from typing import Sequence

import json5
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from sqlalchemy import (
    Connection,
    Inspector,
    MetaData,
    event,
)
from sqlalchemy.orm import Session, sessionmaker

from . import crud, models, schemas
from .database import SessionLocal, engine

inspector = Inspector(engine)
table_names = inspector.get_table_names()
if "questions" not in table_names or "categories" not in table_names:

    @event.listens_for(models.Base.metadata, "after_create")
    def populate(target: MetaData, connection: Connection, **kwargs):
        Session = sessionmaker(bind=connection)
        session = Session()
        with open("app/leetcode.json", mode="r") as f:
            data = json5.load(f)
            for entry in data:
                try:
                    question = schemas.QuestionCreate(
                        title=entry["title"],
                        description=entry["question"]
                        + "\n"
                        + "\n".join(entry["examples"]),
                        categories=[
                            schemas.CategoryCreate(name=c) for c in entry["category"]
                        ],
                        complexity=entry["complexity"],
                    )
                    if crud.get_question_by_title(session, question.title):
                        continue
                    crud.create_question(session, question)

                except ValidationError as e:
                    print(e)
                except KeyError as e:
                    print(e)
        session.close()

    models.Base.metadata.create_all(bind=engine)


app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
def get_categories(db: Session = Depends(get_db)) -> Sequence[schemas.Category]:
    return db.query(models.Category).all()


@app.get("/questions/categories/names")
def get_category_names(db: Session = Depends(get_db)) -> Sequence[str]:
    return [r[0] for r in db.query(models.Category.name).all()]


@app.get("/questions/complexities")
def get_complexities(db: Session = Depends(get_db)) -> list[str]:
    return [complexity.value for complexity in schemas.Complexity]


@app.post("/questions")
def create_question(
    question: schemas.QuestionCreate, db: Session = Depends(get_db)
) -> schemas.Question:
    db_question = crud.create_question(db, question)
    return db_question


@app.get("/questions")
def get_questions(db: Session = Depends(get_db)) -> Sequence[schemas.Question]:
    return crud.get_questions(db)
