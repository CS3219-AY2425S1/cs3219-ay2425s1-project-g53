import { getUserSessions } from '@/actions/collab';
import { currentUser, UserWithToken, verifyCurrentUser } from '@/actions/user'
import useSWR from "swr";

export const useCurrentUser = () => {
  return useSWR("currentUser", async _ => {
    const ok = await verifyCurrentUser();
    return ok ? await currentUser() : null
  })
}

export const useSessions = (user: UserWithToken) => {
  return useSWR(`${user.id}-sessions`, async _ => await getUserSessions(user), { refreshInterval: 1000 });
}
