import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// TODO: re-enable after auth is wired up
// const PROTECTED_ROUTES = ["/", "/community", "/profile", "/security", "/apps", "/activity"];
const PROTECTED_ROUTES: string[] = [];
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_ROUTES.includes(pathname) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (AUTH_ROUTES.includes(pathname) && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/community", "/profile", "/security", "/apps", "/activity", "/login", "/signup"],
};
