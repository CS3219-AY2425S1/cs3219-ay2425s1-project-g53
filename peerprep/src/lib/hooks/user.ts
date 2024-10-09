import { useEffect, useState } from "react";
import { login, currentUser, UserWithToken, UserCreate, createUser } from '@/actions/user'
import { pipeResult } from "../utils";
import { redirectAction } from "@/actions/utils";

export const useLogin = (redirect?: string) => {
  const [error, setError] = useState<string | null>(null);
  const loginHook = async (email: string, password: string) => {
    await pipeResult(login, email, password).then(e => e.match(
      async _ => {
        if (redirect) await redirectAction(redirect);
      },
      msg => {
        setError(msg)
      }
    ))
  }
  return { login: loginHook, loginError: error }
}

export const useSignup = (redirect?: string) => {
  const [error, setError] = useState<string | null>(null);
  async function signup(data: UserCreate) {
    await pipeResult(createUser, data).then(r => r.match(
      async _ => {
        if (redirect) await redirectAction(redirect);
      },
      e => {
        setError(e);
      }
    ))
  }
  return { signup: signup, signupError: error }
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserWithToken | null>(null);
  useEffect(() => {
    async function temp() {
      setUser(await currentUser());
    }
    temp();
  }, [])
  return user;
}
