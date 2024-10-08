import { useEffect, useState } from "react";
import { login, currentUser, UserWithToken } from '@/actions/user'

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const loginHook = async (email: string, password: string) => {
    (await login(email, password)).match(
      user => {
        console.log(user + " logged in")
      },
      msg => {
        setError(msg)
      }
    )
  }
  return { login: loginHook, loginError: error }
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
