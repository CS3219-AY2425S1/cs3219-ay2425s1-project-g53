"use server"
import { revalidatePath } from "next/cache";

export type Complexity = "Easy" | "Medium" | "Hard";
export interface Category {
  id: number
  name: string
}

export interface Error {
  message: string
}

export interface Question {
  id: number,
  title: string;
  description: string;
  categories: { id: number, name: string }[];
  complexity: Complexity;
}

export interface QuestionAdd {
  title: string,
  description: string,
  categories: { name: string }[],
  complexity: Complexity
}

const API_URL = process.env.QUESTION_API_URL;

export async function getCategories(): Promise<Category[]> {
  return await fetch(`${API_URL}/categories`, { cache: "no-store" })
    .then(r => r.ok ? r : Promise.reject("Database error"))
    .then(r => r.json());
}

export async function getQuestions(): Promise<Question[]> {
  return await fetch(`${API_URL}/questions`, { cache: "no-store" })
    .then(r => r.ok ? r : Promise.reject("Database error"))
    .then(r => r.json());
}

export async function getQuestion(id: number): Promise<Question> {
  return await fetch(`${API_URL}/questions/id/${id}`)
    .then(r => r.ok ? r : Promise.reject("Invalid question ID"))
    .then(r => r.json())
    .catch(e => { throw new Error(e) });

}

export async function addQuestion(question: QuestionAdd): Promise<Question> {

  const res: Question = await fetch("http://localhost:5000/questions/create", {
    method: "POST",
    body: JSON.stringify(question),
    headers: { "Content-type": "application/json" }
  }).then(r => {
    if (r.ok) {
      return r.json();
    } else {
      console.log(r.json());
      throw new Error("Failed to add question");
    }
  });

  revalidatePath("/questions");

  return res;
}
