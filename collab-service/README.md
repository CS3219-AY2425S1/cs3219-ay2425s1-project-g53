# Collab service for peerprep

## Environment variables
### PORT (default: 3000)
Port the server will listen on.

### TIMEOUT (default: 60)
Time in seconds the server will wait before deleting persisted data.

## Endpoints
### /ws/:session (WEBSOCKET)
Websocket endpoint for yjs/hocuspocus providers.
Use session name as yjs document.
#### Request params
session: Session Name returned by /create
#### Errors
Websocket closes with status code 1002 if session does not exist

### /create (POST)
Attempt to create a session with 2 users and a question.

#### Request Body

```
  {
    user_1: string,
    user_2: string,
    question_id: number  
  }
```

#### Response
##### 200
Returns session name in body. Existing session name is returned if session already exists.
##### 400
Returned if request body fails to parse.

### /sessions/:userid (GET)
#### Request Params
userid: unique identifier of user

#### Response Body

```
[session1, sessions2, ...] | []
```
