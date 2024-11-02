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
.then((data) => {
    const validatedData = AttemptSchema.array().parse(data); // Validate the array using Zod schema
    const sortedData = validatedData.sort((a, b) => new Date(b.attemptStart).getTime() - new Date(a.attemptStart).getTime());
    return sortedData;
  })
.catch((error) => {
    console.error("Failed to fetch attempts:", error);
    throw error;
});
}
