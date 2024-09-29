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
        with open("leetcode.json", mode="r") as f:
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
                    if session.query(models.Question).filter(models.Question.title == question.title).first():
                        continue
                    db_question = models.Question(
                        title=question.title,
                        description=question.description,
                        complexity=question.complexity.value,
                    )
                    categories = []
                    for category in question.categories:
                        db_category = session.query(models.Category).filter(models.Category.name == category.name).first()
                        if db_category is None:
                            db_category = crud.create_category(session, category)
                        categories.append(db_category)
                    db_question.categories = categories
                    session.add(db_question)
                    session.commit()
                    session.refresh(db_question)
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

@app.post("/questions/create")
def create_question(
    question: schemas.QuestionCreate, db: Session = Depends(get_db)
) -> schemas.Question:
    db_question = crud.create_question(db, question)
    return db_question

@app.get("/questions")
def get_questions(db: Session = Depends(get_db)) -> Sequence[schemas.Question]:
    return crud.read_questions(db)

@app.get("/questions/categories/id/{category_id}")
def get_questions_by_category_id(category_id: int, db: Session = Depends(get_db)) -> Sequence[schemas.Question]:
    return crud.read_questions_by_category_id(db, category_id)

@app.get("/questions/categories/name/{category_name}")
def get_questions_by_category_name(category_name: str, db: Session = Depends(get_db)) -> Sequence[schemas.Question]:
    return crud.read_questions_by_category_name(db, category_name)

@app.get("/questions/complexities/{complexity}")
def get_questions_by_complexity(complexity: schemas.Complexity, db: Session = Depends(get_db)) -> Sequence[schemas.Question]:
    return crud.read_questions_by_complexity(db, complexity)

@app.get("/questions/id/{question_id}")
def get_question(question_id: int, db: Session = Depends(get_db)) -> schemas.Question:
    return crud.read_question(db, question_id)

@app.get("/questions/title/{question_title}")
def get_question_by_title(question_title: str, db: Session = Depends(get_db)) -> schemas.Question:
    return crud.read_question_by_title(db, question_title)

@app.put("/questions/{question_id}", response_model=schemas.Question)
def update_question(question_id: int, question_update: schemas.QuestionUpdate, db: Session = Depends(get_db)) -> schemas.Question:
    return crud.update_question(db,question_id, question_update)

@app.delete("/questions/id/{question_id}", response_model=schemas.DeleteResponse)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    return crud.delete_question(db, question_id)

@app.delete("/questions/title/{question_title}", response_model=schemas.DeleteResponse)
def delete_question_by_title(question_title: str, db: Session = Depends(get_db)):
    return crud.delete_question_by_title(db, question_title)

@app.post("/categories/create")
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)) -> schemas.Category:
    return crud.create_category(db, category)

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)) -> Sequence[schemas.Category]:
    return crud.read_categories(db)

@app.get("/categories/id/{category_id}")
def get_category(category_id: int, db: Session = Depends(get_db)) -> schemas.Category:
    return crud.read_category(db, category_id)

@app.get("/categories/name/{category_name}")
def get_category_by_name(category_name: str, db: Session = Depends(get_db)) -> schemas.Category:
    return crud.read_category_by_name(db, category_name)

@app.put("/categories/{category_name}", response_model=schemas.Category)
def update_category(category_name: str, category_update: schemas.CategoryUpdate, db: Session = Depends(get_db)) -> schemas.Category:
    return crud.update_category(db,category_name, category_update)

@app.delete("/categories/id/{category_id}", response_model=schemas.DeleteResponse)
def delete_question(category_id: int, db: Session = Depends(get_db)):
    return crud.delete_category(db, category_id)

@app.delete("/categories/name/{category_name}", response_model=schemas.DeleteResponse)
def delete_question(category_name: str, db: Session = Depends(get_db)):
    return crud.delete_category_by_name(db, category_name)

@app.get("/complexities")
def get_complexities(db: Session = Depends(get_db)) -> list[str]:
    return [complexity.value for complexity in schemas.Complexity]