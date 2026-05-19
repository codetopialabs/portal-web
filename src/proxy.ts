import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/",
  "/community",
  "/activity",
  "/mentorship",
  "/resources",
  "/settings",
  "/settings/profile",
  "/settings/security",
  "/settings/apps",
];
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  if (process.env.DEV_BYPASS_AUTH === "true") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isOnboarded = request.cookies.get("isOnboarded")?.value;
  const hasSession = Boolean(accessToken || refreshToken);

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users away from /onboarding
  if (pathname === "/onboarding" && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  // Keep users with a refresh token on the protected route so the client can
  // silently rehydrate the access token instead of bouncing them to login.
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect already-onboarded users away from /onboarding
  if (pathname === "/onboarding" && hasSession && isOnboarded === "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow non-onboarded authenticated users to access /onboarding
  if (pathname === "/onboarding" && hasSession && isOnboarded !== "true") {
    return NextResponse.next();
  }

  // Redirect non-onboarded authenticated users away from protected routes
  if (isProtected && hasSession && isOnboarded !== "true") {
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
    "/resources/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/onboarding",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ],
};
