from pydantic import BaseModel
from datetime import datetime

class UserRequest(BaseModel):
    user_id: string
    question_id: int

class Match(BaseModel):
    user_1: string
    user_2: string
    question_id: int
    match_time: datetime