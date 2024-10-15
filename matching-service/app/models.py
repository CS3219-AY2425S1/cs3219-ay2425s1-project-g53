from pydantic import BaseModel
from datetime import datetime

class UserRequest(BaseModel):
    user_id: int
    question_id: int

class Match(BaseModel):
    user_1: int
    user_2: int
    question_id: int
    match_time: datetime