import { z } from "zod";

export const MatchSchema = z.object({
  user_1: z.string(),
  user_2: z.string(),
  question_id: z.number(),
  match_time: z.string()
})
export type Match = z.infer<typeof MatchSchema>;

export const sessionSchema = z.object({
  name: z.string(),
  users: z.array(z.string()),
  question: z.number()
});

export type Session = z.infer<typeof sessionSchema>;

export const ExecutionResultSchema = z.object({
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
