from sqlalchemy.orm import Session

from . import models, schemas


def get_question(db: Session, question_id: int):
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def get_question_by_title(db: Session, question_title: str):
    return db.query(models.Question).filter(models.Question.title == question_title).first()


def get_questions(db: Session, skip: int = 0, limit: int | None = None):
    return db.query(models.Question).offset(skip).limit(limit).all()


def get_category_by_name(db: Session, category_name: str):
    return (
        db.query(models.Category).filter(models.Category.name == category_name).first()
    )


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def create_question(db: Session, question: schemas.QuestionCreate) -> models.Question:
    db_question = models.Question(
        title=question.title,
        description=question.description,
        complexity=question.complexity.value,
    )
    categories = []
    for category in question.categories:
        db_category = get_category_by_name(db, category.name)
        if db_category is None:
            db_category = create_category(db, category)
        categories.append(db_category)

    db_question.categories = categories

    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question
