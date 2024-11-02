"use server"
import { revalidatePath } from "next/cache";
import { z } from 'zod'

const AttemptSchema = z.object({
  id: z.string(),
  users: z.array(z.string()),
  problem: z.string(),
  attemptStart: z.string(),
  attemptEnd: z.string(),
  attemptCode: z.string(),
  createdAt: z.string()
});

export type Attempt = z.infer<typeof AttemptSchema>

async function checkOk(r: Response) {
  if (r.ok) {
    return r;
  }
  throw new Error("Non ok response");
}

export async function getUserAttempts(user: string): Promise<Attempt[]> {
  return await fetch(`http://history-service:8088/fetchUserAttempts/${user}`, {cache: "no-store" })
.then(checkOk)
.then((r) => r.json())
.then((data) => AttemptSchema.array().parse(data)) // Adjusted to validate the array
.catch((error) => {
    console.error("Failed to fetch attempts:", error);
    throw error;
});
}
