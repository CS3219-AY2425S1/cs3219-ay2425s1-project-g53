from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class UserRequest(BaseModel):
    user_id: UUID
    question_id: int

class Match(BaseModel):
    user_1: UUID
    user_2: UUID
    question_id: int
    match_time: datetime