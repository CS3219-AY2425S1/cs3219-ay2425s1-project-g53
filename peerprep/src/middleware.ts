import { currentUser, logout, verifyCurrentUser } from "@/actions/user";
import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/user/settings", "/match"]
const authPaths = ["/user/login", "/user/signup"]

export default async function middleware(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  const user = await currentUser();
  if (user && !await verifyCurrentUser()) {
    await logout();
  }
  if (protectedPaths.filter(s => request.nextUrl.pathname.startsWith(s)).length !== 0 && !(await verifyCurrentUser())) {
    console.log("Not logged in")
    const newUrl = new URL("/user/login", request.url);
    return NextResponse.redirect(newUrl);
  }
  if (authPaths.filter(s => request.nextUrl.pathname.startsWith(s)).length !== 0 && (await verifyCurrentUser())) {
    console.log("Already logged in");
    return NextResponse.redirect(new URL("/user/settings", request.url));
  }
}
