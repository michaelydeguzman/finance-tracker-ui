import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Routes reachable while signed out. Everything else requires a session. */
const PUBLIC_PAGES = new Set(["/login"]);

const isPublicPage = (pathname: string): boolean =>
  PUBLIC_PAGES.has(pathname) || pathname.startsWith("/api/auth/");

export default auth((request) => {
  const { pathname, search } = request.nextUrl;

  if (request.auth || isPublicPage(pathname)) {
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
