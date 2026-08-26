import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Routes reachable while signed out. Everything else requires a session.
 *
 * The account pages are all reached by someone who cannot sign in yet — registering,
 * recovering a password, or following a link from an email — so gating them behind a
 * session would make them unreachable by the only people who need them.
 */
const PUBLIC_PAGES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/magic-link",
]);

const isPublicPage = (pathname: string): boolean =>
  PUBLIC_PAGES.has(pathname) ||
  pathname.startsWith("/api/auth/") ||
  pathname.startsWith("/api/account/");

export default auth((request) => {
  const { pathname, search } = request.nextUrl;

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  // A session whose API credentials could not be renewed is not a session. Treated as
  // signed out rather than left to fail one request at a time with a confusing error.
  const hasUsableSession = request.auth && !request.auth.error;

  if (hasUsableSession) {
    return NextResponse.next();
  }

  // BFF routes answer with 401 instead of an HTML redirect so `apiFetch`
  // surfaces a real error rather than parsing a login page as JSON.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  // Everything except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
