"use server"

import { cookies } from "next/headers";
import { z } from "zod";
import { fetchResult, parseJsonResult, validateResponse, zodParseResult } from "@/lib/utils";
import { err, Result } from "neverthrow";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_URL = process.env.USER_API_URL;
const COOKIE_KEY = "currentUser";


const userCreateSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string()
});

const userUpdateSchema = userCreateSchema.extend({
  id: z.string()
});

const userSchema = userUpdateSchema.extend({
  createdAt: z.coerce.date(),
  isAdmin: z.boolean(),
}).omit({ password: true });

const userWithTokenSchema = userSchema.extend({
  accessToken: z.string(),
});

const responseSchema = z.object({
  message: z.string(),
  data: z.union([userWithTokenSchema, userSchema])
})


type ResponseType = z.infer<typeof responseSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type User = z.infer<typeof userSchema>;
export type UserWithToken = z.infer<typeof userWithTokenSchema>;

export const currentUser = async () => {
  const temp = cookies().get(COOKIE_KEY)?.value;
  if (!temp) {
    return null;
  }
  const user = parseJsonResult(temp).andThen(x => zodParseResult(x, userWithTokenSchema));
  return user.unwrapOr(null);
}

export const verifyCurrentUser = async () => {
  const user = await currentUser();
  if (!user) {
    return false;
  }
  const path = `${API_URL}/auth/verify-token`;
  return await fetchResult(path, { headers: { "Authorization": `Bearer ${user.accessToken}` }, cache: "no-store" })
    .map(r => {
      if (r.ok) {
        return true;
      }
      logout();
      return false;
    }).unwrapOr(false);
}

export const logout = async () => {
  cookies().delete(COOKIE_KEY);
  revalidatePath("/");
}

export const login = async (email: string, password: string) => {
  const path = `${API_URL}/auth/login`;
  return await fetchResult(path, {
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
    headers: { "Content-type": "application/json" }
  }).andThen(r => {
    switch (r.status) {
      case 401:
        return err("Incorrect Email/Password");
      case 200:
        return validateResponse(r, responseSchema)
          .andThen(r => zodParseResult(r.data, userWithTokenSchema))
          .map(u => {
            cookies().set(COOKIE_KEY, JSON.stringify(u));
            revalidatePath("/");
            return u;
          });
      default:
        return err("Login Error")
    }
  });
}

export const createUser = async (data: UserCreate): Promise<Result<User, string>> => {
  const path = `${API_URL}/users`;
  return await fetchResult(path, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-type": "application/json" }
  }).andThen(r => {
    switch (r.status) {
      case 201:
        return validateResponse(r, responseSchema)
          .andThen((o: ResponseType) => zodParseResult(o.data, userSchema));
      case 409:
        return err("Duplicate Email/Username")
      default:
        return err("API Error")
    }
  })
}

export const updateUser = async (data: UserUpdate) => {
  const user = await currentUser();
  if (!user) {
    return err("User not logged in");
  }
  if (user.id !== data.id) {
    logout();
    return err("User not logged in");
  }

  const path = `${API_URL}/users/${data.id}`;

  return await fetchResult(path, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-type": "application/json", "Authorization": `Bearer ${user.accessToken}` }
  }).andThen(r => {
    switch (r.status) {
      case 200:
        return validateResponse(r, responseSchema)
          .andThen((o: ResponseType) => zodParseResult(o.data, userSchema))
          .map(updated => {
            const updatedUser = { accessToken: user.accessToken, ...updated };
            cookies().set(COOKIE_KEY, JSON.stringify(updatedUser));
            return updatedUser;
          });
      case 409:
        return err("Duplicate Email/Username");
      default:
        return err("Update user error");
    }
  })
}


