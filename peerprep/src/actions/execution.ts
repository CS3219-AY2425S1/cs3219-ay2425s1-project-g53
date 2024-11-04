"use server"

import { Language } from "@/components/editor";
import axios from "axios";
import { z } from "zod";

const API_URL = process.env.EXECUTION_API_URL;

const ExecutionResultSchema = z.object({
  run: z.object({
    stdout: z.string(),
    stderr: z.string(),
    code: z.nullable(z.number()),
    output: z.string(),
  }),
  compile: z.object({
    stdout: z.string(),
    stderr: z.string(),
    code: z.nullable(z.number()),
    output: z.string(),
  }).optional(),

});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// Need version input for some languages
export async function runCode(language: Language, code: string): Promise<ExecutionResult> {
  const res = await axios.post(`${API_URL}/execute`, { language: language as string, code: code });
  console.log(res.data);
  return ExecutionResultSchema.parse(res.data);
}
