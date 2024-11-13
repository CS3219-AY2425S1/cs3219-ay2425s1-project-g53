import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError, TypeAdapter
from typing import Dict
from . import models
import psycopg2 as pg
import os
import random

MATCH_TIMEOUT = 15

app = FastAPI()

connected_users: Dict[str, WebSocket] = {}
timeout_tracker: Dict[str, asyncio.Task] = {}
queue: Dict[str, set[int]] = {}

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

conn = pg.connect(
    os.environ.get("DB_URL", "postgresql://admin:admin@localhost:5433/pp-crud")
)


# @app.get("/check_waiting/")
# async def check_waiting():
#     return {"message": match_finder}


@app.get("/check_sockets/")
async def check_sockets():
    return {"message": list(connected_users.keys())}


# Frontend calls this API endpoint to establish a websocket connection with the matching-service.
# This websocket connection is used by matching-service to inform the frontend of a successful match or timeout.
# Websocket connection must be established each time a find match post request is sent.
# A timeout or successful match will terminate the websocket connection.
@app.websocket("/ws/{user_id}")
async def websocket_connect(websocket: WebSocket, user_id: str):
    if user_id in connected_users:
        raise HTTPException(status_code=400, detail="User already matching")

    await websocket.accept()
    connected_users[user_id] = websocket
    try:
        while True:
            text = await websocket.receive_text()
            try:
                request: models.FullUserRequest = TypeAdapter(
                    models.FullUserRequest
                ).validate_json(text)
                asyncio.create_task(find_match(request))
            except ValidationError:
                print(f"Unknown message received: {text}")

    except WebSocketDisconnect:
        if user_id in connected_users:
            del connected_users[user_id]
        if user_id in timeout_tracker:
            timeout_tracker[user_id].cancel()
            del timeout_tracker[user_id]
        if user_id in queue:
            del queue[user_id]


async def find_match(request: models.FullUserRequest):
    user_id = request.user_id
    suitable_questions: set[int] = set()
    if isinstance(request, models.DynamicUserRequest):
        categories = tuple(request.categories)
        complexities = tuple(request.complexities)
        print(categories, complexities)
        with conn.cursor() as cursor:
            query = """
SELECT q.id
FROM questions q
JOIN question_categories qc ON q.id = qc.question_id
JOIN categories c ON c.id = qc.category_id
            """
            if len(categories) != 0 and len(complexities) != 0:
                condition = "WHERE c.name IN %s AND q.complexity IN %s"
                vars = (categories, complexities)
            elif len(complexities) != 0:
                condition = "WHERE q.complexity IN %s"
                vars = (complexities,)
            elif len(categories) != 0:
                condition = "WHERE c.name IN %s"
                vars = (categories,)
            else:
                condition = ""
                vars = None
            cursor.execute(f"{query} {condition}", vars)
            for row in cursor.fetchall():
                suitable_questions.add(row[0])


    else:
        question_id = request.question_id
        suitable_questions.add(question_id)

    for other_user, other_questions in queue.items():
        if user_id == other_user:
            return {"message": "User already in search queue, please be patient!"}

        intersect = other_questions.intersection(suitable_questions)
        print("intersect: ", intersect)
        if len(intersect) > 0:
            matched_question = random.choice(tuple(intersect))
            user_id_new_match = models.Match(
                user_1=user_id,
                user_2=other_user,
                question_id=matched_question,
                match_time=datetime.now(),
            )
            collab_user_new_match = models.Match(
                user_1=other_user,
                user_2=user_id,
                question_id=matched_question,
                match_time=datetime.now(),
            )


            await notify_match_found(user_id, user_id_new_match)
            await notify_match_found(other_user, collab_user_new_match)
            await cancel_timeout(other_user)
            del queue[other_user]
            return

    
    print("Suitable questions: ", suitable_questions)
    print(queue)
    queue[user_id] = suitable_questions
    print(queue)

    timeout_task = asyncio.create_task(timeout(user_id))
    timeout_tracker[user_id] = timeout_task

async def timeout(user_id: str):
    try:
        await asyncio.sleep(MATCH_TIMEOUT)

        if user_id in queue:
            del queue[user_id]
            await notify_match_timeout(user_id)
            await terminate_websocket(user_id)

    except asyncio.CancelledError:
        pass


async def notify_match_found(user_id: str, match: models.Match):
    if user_id in connected_users:
        await connected_users[user_id].send_text(match.model_dump_json())


async def notify_match_timeout(user_id: str):
    if user_id in connected_users:
        await connected_users[user_id].send_text(
            "Timed out while waiting for match. Please try again."
        )

async def cancel_timeout(user_id: str):
    if user_id in timeout_tracker:
        timeout_tracker[user_id].cancel()
        del timeout_tracker[user_id]


async def terminate_websocket(user_id: str):
    if user_id in connected_users:
        await connected_users[user_id].close()
