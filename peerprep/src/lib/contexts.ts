import { UserWithToken } from "@/actions/user";
import { createContext } from "react";

export const UserContext = createContext<UserWithToken | null>(null);
