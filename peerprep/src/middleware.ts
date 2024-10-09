import { currentUser, logout, verifyCurrentUser } from "@/actions/user";
import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/user/settings", "/match"]
const authPaths = ["/user/login", "/user/signup"]

export default async function middleware(request: NextRequest) {
  const user = await currentUser();
  const params = request.nextUrl.searchParams;
  const redirect = params.get("redirect") ?? "/"

  if (user && !await verifyCurrentUser()) {
    await logout();
  }
  if (protectedPaths.filter(s => request.nextUrl.pathname.startsWith(s)).length !== 0 && !(await verifyCurrentUser())) {
    console.log("Not logged in")
    const newUrl = new URL("/user/login", request.url);
    const searchParams = new URLSearchParams({ redirect: request.nextUrl.pathname });
    return NextResponse.redirect(`${newUrl}?${searchParams}`);
  }
  if (authPaths.filter(s => request.nextUrl.pathname.startsWith(s)).length !== 0 && (await verifyCurrentUser())) {
    console.log("Already logged in");
    return NextResponse.redirect(new URL(redirect, request.url));
  }
}
