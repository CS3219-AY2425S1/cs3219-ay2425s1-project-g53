from enum import Enum
from typing import Annotated, List

from pydantic import BaseModel, StringConstraints

class Complexity(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class CategoryBase(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2)]

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int

class CategoryUpdate(CategoryBase):
    pass

class QuestionBase(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2)]
    description: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5)]
    complexity: Complexity

class QuestionCreate(QuestionBase):
    categories: List[CategoryCreate]

class QuestionRead(QuestionBase):
    id: int

class QuestionUpdate(QuestionBase):
    categories: List[CategoryBase]

class Category(CategoryRead):
    questions: List[QuestionRead]
    class Config:
        from_attributes = True

class Question(QuestionRead):
    categories: List[CategoryRead]
    class Config:
        from_attributes = True

class DeleteResponse(BaseModel):
    message: str