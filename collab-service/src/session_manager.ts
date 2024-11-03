import z from "zod"
import { v4 as uuidv4 } from 'uuid';
import { Document } from "@hocuspocus/server";

export const MatchSchema = z.object({
  user_1: z.string(),
  user_2: z.string(),
  question_id: z.number(),
})
export type Match = z.infer<typeof MatchSchema>;
export type User = string;
export type SessionName = string;
export type Question = number;

export class Session {
  name: SessionName
  users: User[]
  document: Document
  question: Question

  constructor(match: Match) {
    this.users = [match.user_1, match.user_2].sort();
    this.name = uuidv4();
    this.document = new Document(this.name);
    this.question = match.question_id;
  }

  toJSON() {
    return {
      name: this.name,
      users: this.users,
      question: this.question
    }
  }
}

export class SessionManager {
  private userMap: Map<User, Map<SessionName, Session>>
  private sessionMap: Map<SessionName, Session>
  private sessionDelete: Map<SessionName, NodeJS.Timeout>

  constructor() {
    this.userMap = new Map();
    this.sessionMap = new Map();
    this.sessionDelete = new Map();
  }

  createSession(match: Match): string {
    if (this.userMap.has(match.user_1)) {
      const map = this.userMap.get(match.user_1)!;
      for (const session of map.values()) {
        if (session.users.includes(match.user_2)) {
          return session.name;
        }
      }
    }

    const session = new Session(match);
    const map_1 = (this.userMap.has(match.user_1) ? this.userMap : this.userMap.set(match.user_1, new Map())).get(match.user_1)!;
    const map_2 = (this.userMap.has(match.user_2) ? this.userMap : this.userMap.set(match.user_2, new Map())).get(match.user_2)!;

    map_1.set(session.name, session);
    map_2.set(session.name, session);
    this.sessionMap.set(session.name, session);

    return session.name;
  }

  deleteSession(name: SessionName, timeout?: number) {
    if (timeout) {
      this.cancelTimeout(name);
      const timer = setTimeout(() => this.deleteSession(name), timeout);
      this.sessionDelete.set(name, timer);
      return;
    }
    console.log(`Delete session ${name}`);
    const session = this.sessionMap.get(name);
    if (!session) {
      return;
    }
    for (const user of session.users) {
      const sessions = this.userMap.get(user)!;
      sessions.delete(session.name);
    }
    this.sessionMap.delete(name);
  }

  cancelTimeout(name: SessionName) {
    const timer = this.sessionDelete.get(name);
    if (!timer) {
      return;
    }
    console.log(`Clear timeout of session ${name}`);
    clearTimeout(timer);
    this.sessionDelete.delete(name);
  }

  getSession(sessionName: SessionName): Session | undefined {
    return this.sessionMap.get(sessionName);
  }

  getSessions(user: User): Session[] {
    return [...this.userMap.get(user)?.values() ?? []]
  }

  saveSession(sessionName: SessionName, document: Document) {
    const session = this.sessionMap.get(sessionName);
    if (!session) {
      return;
    }
    session.document = document;
  }
}
