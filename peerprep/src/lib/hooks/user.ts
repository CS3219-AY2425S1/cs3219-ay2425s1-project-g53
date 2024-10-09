import { useEffect, useState } from "react";
import { currentUser, UserWithToken } from '@/actions/user'

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
