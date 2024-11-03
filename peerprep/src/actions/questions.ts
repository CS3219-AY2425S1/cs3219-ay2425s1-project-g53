"use server"
import axios from "axios";
import { revalidatePath } from "next/cache";
import { z } from 'zod'

const ComplexitySchema = z.enum(["Easy", "Medium", "Hard"]);

const CategorySchema = z.object({
  id: z.number(),
  name: z.string()
});

const QuestionSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  categories: z.array(CategorySchema),
  complexity: ComplexitySchema
});

const QuestionAddSchema = z.object({
  title: z.string(),
  description: z.string(),
  categories: z.array(z.object({
    name: z.string()
  })),
  complexity: ComplexitySchema
})

export type Category = z.infer<typeof CategorySchema>;
export type Complexity = z.infer<typeof ComplexitySchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionAdd = z.infer<typeof QuestionAddSchema>;

const API_URL = process.env.QUESTION_API_URL;


async function checkOk(r: Response) {
  if (r.ok) {
    return r;
  }
  throw new Error("Non ok response");
}

export async function getCategories(): Promise<Category[]> {
  return await fetch(`${API_URL}/categories`, { cache: "no-store" }).then(r => checkOk(r))
    .then(r => r.json())
    .then(z.array(CategorySchema).parse)
}

export async function getQuestions(): Promise<Question[]> {
  return await fetch(`${API_URL}/questions`, { cache: "no-store" })
    .then(r => checkOk(r))
    .then(r => r.json())
    .then(z.array(QuestionSchema).parse)
}

export async function getQuestion(id: number): Promise<Question> {
  return await fetch(`${API_URL}/questions/id/${id}`)
    .then(r => checkOk(r))
    .then(r => r.json())
    .then(QuestionSchema.parse);

}

export async function addQuestion(question: QuestionAdd): Promise<Question> {

  const res: Question = await fetch(`${API_URL}/questions/create`, {
    method: "POST",
    body: JSON.stringify(question),
    headers: { "Content-type": "application/json" }
  }).then(r => {
    return checkOk(r)
  }).then(r => r.json())
    .then(QuestionSchema.parse);

  revalidatePath("/questions");

  return res;
}

export async function updateQuestion(id: number, question: QuestionAdd): Promise<Question>  {
  const res = await axios.put(`${API_URL}/questions/${id}`, question);
  return QuestionSchema.parse(res.data);
}
