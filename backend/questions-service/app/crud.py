from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi import HTTPException

from . import models, schemas

def create_question(db: Session, question: schemas.QuestionCreate) -> models.Question:
    try:
        # Create the question model instance
        db_question = models.Question(
            title=question.title,
            description=question.description,
            complexity=question.complexity.value,
        )

        # Create or retrieve categories
        categories = []
        for category in question.categories:
            db_category = read_category_by_name(db, category.name)
            if db_category is None:
                db_category = create_category(db, category)
            categories.append(db_category)

        # Associate categories with the question
        db_question.categories = categories

        # Add the question to the session and commit the transaction
        db.add(db_question)
        db.commit()

        # Refresh the instance to reflect any changes made during the commit
        db.refresh(db_question)

        return db_question

    except IntegrityError as e:
        # Handle database integrity issues, e.g., duplicate questions or categories
        db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=400, detail="Question or category already exists.")

    except SQLAlchemyError as e:
        # Handle SQLAlchemy-related errors
        db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=500, detail="Database error occurred while creating the question.")

    except Exception as e:
        # Handle any other unexpected errors
        db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=500, detail="An unexpected error occurred while creating the question.")


def read_questions(db: Session, skip: int = 0, limit: int | None = None):
    try:
        # Query the questions with offset and limit
        questions = db.query(models.Question).order_by(models.Question.id).offset(skip).limit(limit).all()

        if not questions:
            raise HTTPException(status_code=404, detail=f"Questions not found")

        return questions

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle database-related errors
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Handle other exceptions
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_questions_by_category_id(db: Session, category_id: int, skip: int = 0, limit: int | None = None):
    try:
        # Query the category from the database
        category = db.query(models.Category).filter(models.Category.id == category_id).first()

        # Handle the case where the question is not found
        if category is None:
            raise HTTPException(status_code=404, detail=f"Category with id {category_id} not found")

        # Get the list of questions and apply offset and limit using list slicing
        questions = category.questions[skip:(skip + limit) if limit is not None else None]

        return questions

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Catch any SQLAlchemy-related errors and raise an HTTPException
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Catch any other exceptions and log if necessary
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_questions_by_category_name(db: Session, category_name: str, skip: int = 0, limit: int | None = None):
    try:
        # Query the category from the database
        category = db.query(models.Category).filter(models.Category.name == category_name).first()

        # Handle the case where the question is not found
        if category is None:
            raise HTTPException(status_code=404, detail=f"Category with name {category_name} not found")

        # Get the list of questions and apply offset and limit using list slicing
        questions = category.questions[skip:(skip + limit) if limit is not None else None]

        return questions

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Catch any SQLAlchemy-related errors and raise an HTTPException
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Catch any other exceptions and log if necessary
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_questions_by_complexity(db: Session, complexity: schemas.Complexity, skip: int = 0, limit: int | None = None):
    try:
        # Query questions filtered by complexity
        questions = db.query(models.Question).filter(models.Question.complexity == complexity).offset(skip).limit(limit).all()

        if not questions:
            raise HTTPException(status_code=404, detail=f"Complexity '{complexity}' not found")

        return questions

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred while fetching questions by complexity")

    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_question(db: Session, question_id: int):
    try:
        # Query the question from the database
        question = db.query(models.Question).filter(models.Question.id == question_id).first()
        # Handle the case where the question is not found
        if question is None:
            raise HTTPException(status_code=404, detail=f"Question with id {question_id} not found")

        return question

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Catch any SQLAlchemy-related errors and raise an HTTPException
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Catch any other exceptions and log if necessary
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_question_by_title(db: Session, question_title: str):
    try:
        # Query the question from the database
        question =  db.query(models.Question).filter(models.Question.title == question_title).first()

        # If question not found
        if question is None:
            raise HTTPException(status_code=404, detail=f"Question with title {question_title} not found")

        return question

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle database-related errors
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Handle other exceptions
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def update_question(db: Session, question_id: int, question_update: schemas.QuestionUpdate) -> models.Question:
    try:
        # Fetch the existing question
        question = db.query(models.Question).order_by(models.Question.id).filter(models.Question.id == question_id).first()

        # If question not found
        if question is None:
            raise HTTPException(status_code=404, detail=f"Question with id {question_id} not found")

        # Update fields if provided in the request
        if question_update.title is not None:
            question.title = question_update.title
        if question_update.description is not None:
            question.description = question_update.description
        if question_update.complexity is not None:
            question.complexity = question_update.complexity

        # Commit the updates to the database
        db.commit()

        # Refresh the instance to reflect the updates
        db.refresh(question)

        return question

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except IntegrityError as e:
        # Handle database integrity issues
        db.rollback()
        raise HTTPException(status_code=400, detail="Update failed due to integrity constraints.")

    except SQLAlchemyError as e:
        # Handle any SQLAlchemy-related errors
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while updating the question.")

    except Exception as e:
        # Handle unexpected exceptions
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while updating the question.")


def delete_question(db: Session, question_id: int):
    try:
        # Fetch the question to delete
        question = db.query(models.Question).order_by(models.Question.id).filter(models.Question.id == question_id).first()

        # If question not found
        if question is None:
            raise HTTPException(status_code=404, detail=f"Question with id {question_id} not found")

        # Delete the question from the database
        db.delete(question)
        db.commit()

        return {"message": f"Question with id {question_id} successfully deleted"}

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle SQLAlchemy-related errors
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while deleting the question.")

    except Exception as e:
        # Handle unexpected exceptions
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while deleting the question.")


def delete_question_by_title(db: Session, question_title: str):
    try:
        # Fetch the question to delete
        question = db.query(models.Question).order_by(models.Question.id).filter(models.Question.title == question_title).first()

        # If question not found
        if question is None:
            raise HTTPException(status_code=404, detail=f"Question with title {question_title} not found")

        # Delete the question from the database
        db.delete(question)
        db.commit()

        return {"message": f"Question with title {question_title} successfully deleted"}

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle SQLAlchemy-related errors
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while deleting the question.")

    except Exception as e:
        # Handle unexpected exceptions
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while deleting the question.")


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    try:
        # Create the category model instance
        db_category = models.Category(**category.dict())

        # Add to the session
        db.add(db_category)

        # Commit the transaction
        db.commit()

        # Refresh the instance to reflect any changes made during the commit (e.g., auto-generated ID)
        db.refresh(db_category)

        return db_category

    except IntegrityError as e:
        # Handle database integrity issues such as unique constraint violations
        db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=400, detail="Category with the same name already exists.")

    except SQLAlchemyError as e:
        # Catch any SQLAlchemy-related errors
        db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=500, detail="Database error occurred while creating the category.")

    except Exception as e:
        # Handle other unexpected exceptions
        db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=500, detail="An unexpected error occurred while creating the category.")


def read_categories(db: Session, skip: int = 0, limit: int | None = None):
    try:
        # Query the questions with offset and limit
        categories = db.query(models.Category).offset(skip).limit(limit).all()

        if not categories:
            raise HTTPException(status_code=404, detail=f"Categories not found")

        return categories

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle database-related errors
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Handle other exceptions
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_category(db: Session, category_id: int):
    try:
        # Query the question from the database
        category = db.query(models.Category).filter(models.Category.id == category_id).first()

        # Handle the case where the question is not found
        if category is None:
            raise HTTPException(status_code=404, detail=f"Category with id {category_id} not found")

        return category

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Catch any SQLAlchemy-related errors and raise an HTTPException
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Catch any other exceptions and log if necessary
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_category_by_name(db: Session, category_name: str):
    try:
        # Query the category by name
        category = db.query(models.Category).filter(models.Category.name == category_name).first()

        # If category not found
        if category is None:
            raise HTTPException(status_code=404, detail=f"Category with name {category_name} not found")

        return category

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle database-related errors
        raise HTTPException(status_code=500, detail="Database error occurred")

    except Exception as e:
        # Handle other exceptions
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def update_category(db: Session, category_name: str, category_update: schemas.CategoryUpdate) -> models.Category:
    try:
        # Query the category by name
        category = db.query(models.Category).filter(models.Category.name == category_name).first()

        # If the category does not exist
        if category is None:
            raise HTTPException(status_code=404, detail=f"Category with name '{category_name}' not found")

        # Update the fields
        category.name = category_update.name

        # Commit the updates to the database
        db.commit()

        # Refresh the instance to reflect the updates
        db.refresh(category)

        return category

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except IntegrityError as e:
        # Handle database integrity issues (e.g., updating to a name that already exists)
        db.rollback()
        raise HTTPException(status_code=400, detail="Category with the same name already exists.")

    except SQLAlchemyError as e:
        # Handle other database-related errors
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while updating the category.")

    except Exception as e:
        print(e)
        # Handle unexpected exceptions
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while updating the category.")


def delete_category(db: Session, category_id: int):
    try:
        # Fetch the question to delete
        question = db.query(models.Category).filter(models.Category.id == category_id).first()

        # If question not found
        if question is None:
            raise HTTPException(status_code=404, detail=f"Category with id {category_id} not found")

        # Delete the question from the database
        db.delete(question)
        db.commit()

        return {"message": f"Category with id {category_id} successfully deleted"}

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle SQLAlchemy-related errors
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while deleting the question.")

    except Exception as e:
        # Handle unexpected exceptions
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while deleting the Category.")


def delete_category_by_name(db: Session, category_name: str):
    try:
        # Query the category by name
        category = db.query(models.Category).filter(models.Category.name == category_name).first()

        # If the category does not exist
        if category is None:
            raise HTTPException(status_code=404, detail=f"Category with name '{category_name}' not found")

        # Delete the category
        db.delete(category)
        db.commit()

        return {"message": f"Category with name '{category_name}' successfully deleted"}

    except HTTPException as http_exc:
        # Let HTTPException pass through without being caught by the generic Exception block
        raise http_exc

    except SQLAlchemyError as e:
        # Handle other database-related errors
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while deleting the category.")

    except Exception as e:
        # Handle unexpected exceptions
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while deleting the category.")