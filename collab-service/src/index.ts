import express from 'express';
import expressWebsockets from 'express-ws';
import 'dotenv/config';
import cors from 'cors';
import { Document, Server } from '@hocuspocus/server';
import { MatchSchema, SessionManager } from "./session_manager"

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
		console.log("Failed to parse ${tmep} to number, using default timeout value");
		return 60;
	}
})();

const sessionManager = new SessionManager();

const server = Server.configure({
	async onStoreDocument(data) {
		sessionManager.saveSession(data.documentName, data.document);
	},
	async onLoadDocument(data): Promise<Document> {
		return sessionManager.getSession(data.documentName)?.document ?? new Document(data.documentName);
	},
})

app.ws("/ws/:session", (websocket, request) => {
	const sessionName = request.params.session;
	if (!sessionManager.getSession(sessionName)) {
		return;
	}
	server.handleConnection(websocket, request);
})

app.post("/create", (request, response) => {
	try {
		const match = MatchSchema.parse(request.body);
		const sessionName = sessionManager.createSession(match);
		response.status(200).send(sessionName);
	} catch (error) {
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
