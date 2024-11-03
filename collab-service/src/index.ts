import express from 'express';
import expressWebsockets from 'express-ws';
import 'dotenv/config';
import cors from 'cors';
import { Document, Server } from '@hocuspocus/server';
import { MatchSchema, SessionManager } from "./session_manager"
import bodyParser from 'body-parser'

const { app } = expressWebsockets(express());
app.use(cors());
const PORT = process.env.PORT ?? '3000';
const TIMEOUT = (() => {
	const temp = process.env.TIMEOUT;
	if (!temp) {
		return 60;
	}
	try {
		return parseInt(temp);
	} catch (error) {
		console.log(`Failed to parse ${temp} to number, using default timeout value`);
		return 60;
	}
})();

const sessionManager = new SessionManager();

const server = Server.configure({
	timeout: 500,
	async onStoreDocument(data) {
		console.log(`Store document ${data.documentName}`);
		sessionManager.saveSession(data.documentName, data.document);
	},
	async onLoadDocument(data): Promise<Document> {
		console.log(`Load document ${data.documentName}`);
		return sessionManager.getSession(data.documentName)?.document ?? new Document(data.documentName);
	},
	async onAwarenessUpdate(data) {
      if (data.awareness.states.size === 0) {
      	sessionManager.deleteSession(data.documentName, TIMEOUT * 1000);
      } else {
      	sessionManager.cancelTimeout(data.documentName);
      }
  },
})

app.ws("/ws/:session", (websocket, request, next ) => {
	const sessionName = request.params.session;
	websocket.onerror = (error) => {
		console.log(error);
	}
	if (!sessionManager.getSession(sessionName)) {
		websocket.close(4000, "Session does not exist");
		return;
	}
	server.handleConnection(websocket, request);
})

app.post("/create", bodyParser.json(), (request, response) => {
	try {
		const match = MatchSchema.parse(request.body);
		const sessionName = sessionManager.createSession(match);
		response.status(200).send(sessionName);
	} catch (error) {
		console.log(error);
		response.status(400).send("Failed to parse request body");
	}
});

app.get("/sessions/:userid", (request, response) => {
	const user = request.params.userid;
	const sessions = sessionManager.getSessions(user);
	response.status(200).send(sessions);
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
