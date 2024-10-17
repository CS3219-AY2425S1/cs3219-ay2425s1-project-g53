import asyncio
from datetime import datetime
from fastapi import FastAPI, HTTPException
from typing import Dict, Set
from . import models

MATCH_TIMEOUT = 60

app = FastAPI()

matcher: Dict[int, tuple[asyncio.Barrier, list[models.UserRequest]]] = {}
matching: Set[str] = set()
lock = asyncio.Lock()


@app.post(
    "/find_match/",
    status_code=200,
    responses={
        200: {"model": models.Match},
        400: {
            "model": models.HTTPError,
            "description": "User already in the matching process",
        },
        404: {"model": models.HTTPError, "description": "Raised if match timeout"},
        500: {"model": models.HTTPError, "description": "Internal Server Error"},
    },
)
async def find_match(request: models.UserRequest) -> models.Match:
    question_id = request.question_id
    user_id = request.user_id
    if user_id in matching:
        raise HTTPException(status_code=400, detail="User already matching")

    matching.add(user_id)

    # try:
    if question_id not in matcher:
        async with lock:
            barrier = asyncio.Barrier(2)
            matcher[question_id] = (barrier, [request])

        try:
            await asyncio.wait_for(barrier.wait(), MATCH_TIMEOUT)
            async with lock:
                users: list[models.UserRequest] = matcher[question_id][1]
                del matcher[question_id]
                return models.Match(
                    user_1=users[0].user_id,
                    user_2=users[1].user_id,
                    question_id=question_id,
                    match_time=datetime.now(),
                )

        except TimeoutError:
            async with lock:
                del matcher[question_id]
            raise HTTPException(status_code=404, detail="Match Timeout")

    else:
        async with lock:
            (barrier, users) = matcher[question_id]
            users.append(request)

        await barrier.wait()

        async with lock:
            return models.Match(
                user_1=users[0].user_id,
                user_2=users[1].user_id,
                question_id=question_id,
                match_time=datetime.now(),
            )

    # finally:
    # raise HTTPException(status_code=500, detail="Unknown error")
