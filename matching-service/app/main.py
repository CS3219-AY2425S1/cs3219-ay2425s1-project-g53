import asyncio
from collections import deque
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from . import models

MATCH_TIMEOUT = 15

app = FastAPI()

match_finder: Dict[str, deque] = {}
connected_users: Dict[str, WebSocket] = {}
timeout_tracker: Dict[str, asyncio.Task] = {}

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

@app.get("/check_waiting/")
async def check_waiting():
    return { "message": match_finder }

@app.get("/check_sockets/")
async def check_sockets():
    return { "message": list(connected_users.keys()) }

# Frontend calls this API endpoint to establish a websocket connection with the matching-service.
# This websocket connection is used by matching-service to inform the frontend of a successful match or timeout.
# Websocket connection must be established each time a find match post request is sent.
# A timeout or successful match will terminate the websocket connection.
@app.websocket("/ws/{user_id}")
async def websocket_connect(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connected_users[user_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if user_id in connected_users:
            del connected_users[user_id]
        if user_id in timeout_tracker:
            timeout_tracker[user_id].cancel()
            del timeout_tracker[user_id]
        for question_id in match_finder:
            if user_id in match_finder[question_id]:
                match_finder[question_id].remove(user_id)


@app.post("/find_match/")
async def find_match(request: models.UserRequest):
    user_id = request.user_id
    question_id = request.question_id

    if question_id not in match_finder:
        match_finder[question_id] = deque()

    # Check whether the user is already in queue
    if match_finder[question_id]:
        if match_finder[question_id][0] == user_id:
            return { "message" : "User already in search queue, please be patient!" }

        collab_user = match_finder[question_id].pop()
        print(match_finder)
        user_id_new_match = models.Match(user_1=user_id,user_2=collab_user,question_id=question_id,match_time=datetime.now())
        collab_user_new_match = models.Match(user_1=collab_user,user_2=user_id,question_id=question_id,match_time=datetime.now())

        await notify_match_found(user_id, user_id_new_match)
        await notify_match_found(collab_user, collab_user_new_match)
        await cancel_timeout(collab_user)

        return
    
    print(match_finder)
    match_finder[question_id].append(user_id)
    print(match_finder)

    timeout_task = asyncio.create_task(match_timeout(user_id, question_id))
    timeout_tracker[user_id] = timeout_task

    return { "message": "Waiting for match..." }

async def notify_match_found(user_id: str, match: models.Match):
    if user_id in connected_users:
        await connected_users[user_id].send_text(match.model_dump_json())

async def notify_match_timeout(user_id: str):
    if user_id in connected_users:
            await connected_users[user_id].send_text("Timed out while waiting for match. Please try again.")

async def match_timeout(user_id: str, question_id: int):
    try:
        await asyncio.sleep(MATCH_TIMEOUT)
        if user_id in match_finder[question_id]:
            match_finder[question_id].remove(user_id)
            await notify_match_timeout(user_id)
            await terminate_websocket(user_id)
    except asyncio.CancelledError:
        pass

async def cancel_timeout(user_id: str):
    if user_id in timeout_tracker:
        timeout_tracker[user_id].cancel()
        del timeout_tracker[user_id]

async def terminate_websocket(user_id: str):
    if user_id in connected_users:
        await connected_users[user_id].close()
