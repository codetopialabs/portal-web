import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/", "/community", "/activity", "/mentorship", "/programs", "/resources", "/settings", "/settings/profile", "/settings/security", "/settings/apps"];
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const isOnboarded = request.cookies.get("isOnboarded")?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users away from /onboarding
  if (pathname === "/onboarding" && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (AUTH_ROUTES.includes(pathname) && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect already-onboarded users away from /onboarding
  if (pathname === "/onboarding" && accessToken && isOnboarded === "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow non-onboarded authenticated users to access /onboarding
  if (pathname === "/onboarding" && accessToken && isOnboarded !== "true") {
    return NextResponse.next();
  }

  // Redirect non-onboarded authenticated users away from protected routes
  if (isProtected && accessToken && isOnboarded !== "true") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/community/:path*",
    "/activity/:path*",
    "/mentorship/:path*",
    "/programs/:path*",
    "/resources/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/onboarding",
  ],
};
