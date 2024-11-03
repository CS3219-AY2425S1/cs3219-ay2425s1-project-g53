import { currentUser,  verifyCurrentUser } from '@/actions/user'
import useSWR from "swr";

export const useCurrentUser = () => {
  return useSWR("currentUser", async _ => {
    const ok = await verifyCurrentUser();
    return ok ? await currentUser() : null
  })
}
