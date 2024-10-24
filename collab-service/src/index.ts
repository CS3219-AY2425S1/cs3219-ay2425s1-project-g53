import  express from 'express';
import expressWebsockets from 'express-ws';
import 'dotenv/config';
import { Server } from '@hocuspocus/server';

const { app } = expressWebsockets(express());
const PORT = process.env.PORT ?? '3000';

const server = Server.configure({
})

app.ws("/", (websocket, request) => {
	console.log(request);
	server.handleConnection(websocket, request);
})

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
