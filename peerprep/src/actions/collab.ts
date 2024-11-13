"use server"

import { z } from "zod";
import { User } from "./user";
import axios from "axios";
import { Match, Session, sessionSchema } from "@/lib/schemas";

const API_URL = process.env.COLLAB_API_URL;

export async function getUserSessions(user: User): Promise<Session[]> {
  return await fetch(`${API_URL}/sessions/${user.id}`, { cache: "no-store" })
    .then(r => r.json())
    .then(z.array(sessionSchema).parse);
}

export async function createSession(match: Match) {
  console.log(API_URL);
  const res = await axios.post(`${API_URL}/create`, match, { withCredentials: true });
  switch (res.status) {
    case 200:
      return z.string().parse(res.data);
    case 400:
      throw new Error("Collab service failed to parse match object");
      break;
    default:
      throw new Error("Unknown error with collab service");
      break;
  }
}
