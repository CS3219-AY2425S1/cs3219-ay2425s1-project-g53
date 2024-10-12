import { NextRequest } from "next/server";
import { currentUser, verifyCurrentUser } from "./actions/user";

const protectedPaths = ["/user"];

export async function middleware(request: NextRequest) {
  if (protectedPaths.filter(p => request.nextUrl.pathname.startsWith(p)).length !== 0) {
    const user = await currentUser();
    if (user) {
      await verifyCurrentUser();
    }
  }
}
