"use server"
import { revalidatePath } from "next/cache";
import { z } from 'zod'
import { User } from "./user";
import { Question } from "./questions";
import axios from "axios";

const API_URL = process.env.HISTORY_API_URL;

const AttemptSchema = z.object({
  id: z.string(),
  users: z.array(z.string()),
  problem: z.string(),
  attemptStart: z.string().optional(),
  attemptEnd: z.string().optional(),
  attemptCode: z.string(),
  createdAt: z.string()
});

export type Attempt = z.infer<typeof AttemptSchema>

async function checkOk(r: Response) {
  if (r.ok) {
    return r;
  } else {
    console.log(r);
  }
  throw new Error("Non ok response");
}

export async function getUserAttempts(user: string): Promise<Attempt[]> {
  return await fetch(`${API_URL}/fetchUserAttempts/${user}`, { cache: "no-store" })
    .then(checkOk)
    .then((r) => r.json())
    .then((data) => {
      const validatedData = AttemptSchema.array().parse(data); // Validate the array using Zod schema
      const sortedData = validatedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sortedData;
    })
    .catch((error) => {
      console.error("Failed to fetch attempts:", error);
      throw error;
    });
}

export async function addAttempt(user1: string, user2: string, question: Question, code: string) {
  await axios.post(`${API_URL}/addAttempt`, { user1: user1, user2: user2, problem: question.title, code: code });
}
