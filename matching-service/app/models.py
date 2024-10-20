from pydantic import BaseModel
from datetime import datetime

class UserRequest(BaseModel):
    user_id: str
    question_id: int

class Match(BaseModel):
    user_1: str
    user_2: str
    question_id: int
    match_time: datetime