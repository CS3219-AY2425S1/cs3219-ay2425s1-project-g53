from pydantic import BaseModel
from datetime import datetime
from typing import Union

class UserRequest(BaseModel):
    user_id: str
    question_id: int

class DynamicUserRequest(BaseModel):
    user_id: str
    categories: list[str]
    complexities: list[str]

type FullUserRequest = Union[UserRequest, DynamicUserRequest]

class Match(BaseModel):
    user_1: str
    user_2: str
    question_id: int
    match_time: datetime
